// Cart logic
let cartItems = [];
try {
    cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
} catch (e) {
    console.error('Error loading cart from localStorage:', e);
}

const products = document.querySelectorAll('.product');
const cartLists = document.querySelectorAll('#cart-items');
const totalDisplays = document.querySelectorAll('.cart-dropdown .total');
const seeMoreButton = document.getElementById('see-more');
const searchForm = document.querySelector('.search-bar');
const searchSelect = searchForm ? searchForm.querySelector('select') : null;
const searchInput = searchForm ? searchForm.querySelector('#search-input') : null;
const autosuggestions = searchForm ? document.getElementById('autosuggestions') : null;
let total = 0;

// Truncate description
function truncateDescription(text, maxLength = 100) {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

// Update cart display
function updateCartDisplay() {
    cartLists.forEach(cartList => {
        cartList.innerHTML = '';
        cartItems.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div class="cart-item">
                    <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <strong>${item.name}</strong>
                        <p class="cart-item-description">${truncateDescription(item.description)}</p>
                        <p>Ksh. ${item.price.toFixed(2)} x ${item.quantity}</p>
                        <button class="remove" data-index="${index}">Remove</button>
                    </div>
                </div>
            `;
            cartList.appendChild(listItem);
        });
    });

    total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalDisplays.forEach(display => {
        display.textContent = `Total: Ksh. ${total.toFixed(2)}`;
    });

    document.querySelectorAll('.cart-count').forEach(count => {
        count.textContent = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    });

    try {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (e) {
        console.error('Error saving cart to localStorage:', e);
    }
}

// Add to cart
products.forEach(product => {
    const name = product.getAttribute('data-name');
    const price = parseFloat(product.getAttribute('data-price'));
    const category = product.getAttribute('data-category');
    const imageUrl = product.querySelector('img').src;
    const description = product.querySelector('p:not(.price)')?.textContent || 'No description available';
    const quantityInput = product.querySelector('.quantity');

    product.querySelector('.add-to-cart').addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        if (quantity < 1) {
            alert('Please select a valid quantity.');
            return;
        }

        const existingItem = cartItems.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cartItems.push({ name, price, category, imageUrl, description, quantity });
        }

        updateCartDisplay();
        quantityInput.value = 1;
    });
});

// Remove from cart
document.querySelectorAll('.cart-dropdown').forEach(dropdown => {
    dropdown.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove')) {
            e.stopPropagation();
            const index = parseInt(e.target.getAttribute('data-index'));
            if (!isNaN(index) && index >= 0 && index < cartItems.length) {
                cartItems.splice(index, 1);
                updateCartDisplay();
            } else {
                console.error('Invalid cart item index:', index);
            }
        }
    });
});

// Cart dropdown toggle
document.querySelectorAll('.cart-icon').forEach(cartIcon => {
    cartIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = cartIcon.querySelector('.cart-dropdown');
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.cart-icon')) {
        document.querySelectorAll('.cart-dropdown').forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    }
});

// See More Button
if (seeMoreButton) {
    seeMoreButton.addEventListener('click', () => {
        document.querySelectorAll('.product.hidden').forEach(product => {
            product.classList.remove('hidden');
        });
        seeMoreButton.style.display = 'none';
    });
}

// Autosuggestions and Product Filters
if (searchForm) {
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const category = searchSelect.value;
        autosuggestions.innerHTML = '';
        autosuggestions.style.display = query ? 'block' : 'none';

        const suggestions = [];
        products.forEach(product => {
            const name = product.getAttribute('data-name').toLowerCase();
            const productCategory = product.getAttribute('data-category');
            const matchesCategory = category === 'all' || productCategory === category;
            const matchesQuery = name.includes(query);

            if (matchesCategory && matchesQuery) {
                suggestions.push(product.getAttribute('data-name'));
                if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                    product.classList.remove('hidden');
                }
            } else {
                if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                    product.classList.add('hidden');
                }
            }
        });

        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            li.addEventListener('click', () => {
                searchInput.value = suggestion;
                autosuggestions.style.display = 'none';
                if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                    products.forEach(product => {
                        const name = product.getAttribute('data-name').toLowerCase();
                        const productCategory = product.getAttribute('data-category');
                        const matchesCategory = category === 'all' || productCategory === category;
                        if (name === suggestion.toLowerCase() && matchesCategory) {
                            product.classList.remove('hidden');
                        } else {
                            product.classList.add('hidden');
                        }
                    });
                } else {
                    window.location.href = `index.html?search=${encodeURIComponent(suggestion)}&category=${category}`;
                }
            });
            autosuggestions.appendChild(li);
        });
    });

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.toLowerCase();
        const category = searchSelect.value;

        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            products.forEach(product => {
                const name = product.getAttribute('data-name').toLowerCase();
                const productCategory = product.getAttribute('data-category');
                const matchesCategory = category === 'all' || productCategory === category;
                const matchesQuery = name.includes(query);

                if (matchesCategory && matchesQuery) {
                    product.classList.remove('hidden');
                } else {
                    product.classList.add('hidden');
                }
            });
            autosuggestions.style.display = 'none';
        } else {
            window.location.href = `index.html?search=${encodeURIComponent(query)}&category=${category}`;
        }
    });

    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        const category = urlParams.get('category');
        if (searchQuery) {
            searchInput.value = searchQuery;
            searchSelect.value = category || 'all';
            products.forEach(product => {
                const name = product.getAttribute('data-name').toLowerCase();
                const productCategory = product.getAttribute('data-category');
                const matchesCategory = category === 'all' || productCategory === category;
                const matchesQuery = name.includes(searchQuery.toLowerCase());

                if (matchesCategory && matchesQuery) {
                    product.classList.remove('hidden');
                } else {
                    product.classList.add('hidden');
                }
            });
        }
    }
}

// Checkout Button
document.querySelectorAll('#checkout').forEach(checkoutButton => {
    checkoutButton.addEventListener('click', () => {
        if (cartItems.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        if (confirm('Confirm your order? You will be redirected to WhatsApp.')) {
            const whatsappNumber = '+254700480098';
            let message = 'Order Details:\n';
            cartItems.forEach(item => {
                message += `${item.name} - Ksh. ${item.price.toFixed(2)} x ${item.quantity}\n`;
            });
            message += `Total: Ksh. ${total.toFixed(2)}\n`;
            message += 'I would like to purchase these items.';
            const encodedMessage = encodeURIComponent(message);

            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
            window.location.href = whatsappURL;

            cartItems = [];
            updateCartDisplay();
        }
    });
});

// Contact Form Submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const feedback = document.createElement('div');
        feedback.id = 'form-feedback';
        feedback.style.marginTop = '10px';
        contactForm.appendChild(feedback);

        const email = contactForm.querySelector('#email').value;
        const name = contactForm.querySelector('#name').value;
        const message = contactForm.querySelector('#message').value;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            feedback.textContent = 'Please enter a valid email address.';
            feedback.style.color = 'red';
            return;
        }
        if (name.trim().length < 2) {
            feedback.textContent = 'Please enter a valid name.';
            feedback.style.color = 'red';
            return;
        }
        if (message.trim().length < 10) {
            feedback.textContent = 'Message must be at least 10 characters long.';
            feedback.style.color = 'red';
            return;
        }

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                contactForm.reset();
                feedback.textContent = 'Thank you for your message! We’ll get back to you soon.';
                feedback.style.color = 'green';
                setTimeout(() => feedback.remove(), 5000);
            } else {
                feedback.textContent = 'Error sending message. Please try again.';
                feedback.style.color = 'red';
            }
        } catch (error) {
            feedback.textContent = 'Network error. Please try again later.';
            feedback.style.color = 'red';
        }
    });
}

// Newsletter Form Submission
const newsletterForms = document.querySelectorAll('.newsletter-form');
newsletterForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.querySelector('input[name="email"]').value;
        const feedback = document.createElement('div');
        feedback.style.marginTop = '10px';
        form.appendChild(feedback);

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            feedback.textContent = 'Please enter a valid email address.';
            feedback.style.color = 'red';
            return;
        }

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                form.reset();
                feedback.textContent = 'Thank you for subscribing to our newsletter!';
                feedback.style.color = 'green';
                setTimeout(() => feedback.remove(), 5000);
            } else {
                feedback.textContent = 'Error subscribing. Please try again.';
                feedback.style.color = 'red';
            }
        } catch (error) {
            feedback.textContent = 'Network error. Please try again later.';
            feedback.style.color = 'red';
        }
    });
});

// Initialize cart display
updateCartDisplay();