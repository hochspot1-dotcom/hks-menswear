/* ==========================================
   ИНТЕРАКТИВНЫЙ ИНТЕРНЕТ-МАГАЗИН МУЖСКОЙ ОДЕЖДЫ (SCRIPT.JS)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    initMiniCart();
    initFullCartPage();
    initCheckoutPage();
    initHeroSlider();
    initCatalogFilters();
    initSearchModal();
    initDropdownFilters();
    initDynamicProductSEO();
});

/* ==========================================
   1. МОДУЛЬ МИНИ-КОРЗИНЫ И БОКОВОГО ДРАВЕРА
   ========================================== */
function initMiniCart() {
    let cart = JSON.parse(localStorage.getItem('hks_cart')) || [
        {
            id: 1,
            title: "OVERSIZE HOODIE URBAN BLACK",
            price: 4990,
            image: "./images/oversize_hoodie_black.jpg",
            quantity: 1
        },
        {
            id: 2,
            title: "CARGO PANTS TACTICAL KHAKI",
            price: 5490,
            image: "./images/cargo_pants_khaki.jpg",
            quantity: 1
        }
    ];

    initCartMarkup();

    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    const closeBtn = document.getElementById('cart-close-btn');
    const cartBtns = document.querySelectorAll('.cart-btn');
    const cartItemsContainer = document.getElementById('cart-drawer-items');
    const cartTotalElement = document.getElementById('cart-total-price');
    const cartBadges = document.querySelectorAll('.cart-btn__badge');

    function saveCart() {
        localStorage.setItem('hks_cart', JSON.stringify(cart));
    }

    function openCart() {
        if (drawer && overlay) {
            drawer.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeCart() {
        if (drawer && overlay) {
            drawer.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    cartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (window.location.pathname.includes('cart.html') || window.location.pathname.includes('checkout.html')) {
                return;
            }
            e.preventDefault();
            openCart();
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeCart);
    if (overlay) overlay.addEventListener('click', closeCart);

    function renderCart() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        
        let totalCount = 0;
        let totalPrice = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty" style="text-align: center; padding: 48px 20px; color: var(--color-text-muted);">
                    <p style="font-family: var(--font-heading); font-size: 0.95rem; font-weight: 800;">Ваша корзина пока пуста</p>
                </div>
            `;
        } else {
            cart.forEach(item => {
                totalCount += item.quantity;
                totalPrice += item.price * item.quantity;

                const itemImg = item.image || './images/oversize_hoodie_black.jpg';

                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <img src="${itemImg}" alt="${item.title}" class="cart-item__img">
                    <div class="cart-item__details">
                        <h4 class="cart-item__title">${item.title}</h4>
                        <div class="cart-item__price">${formatPrice(item.price)} руб</div>
                        <div class="cart-item__controls">
                            <button class="qty-btn minus" data-id="${item.id}">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn plus" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="cart-item__remove" data-id="${item.id}" aria-label="Удалить">
                        ✕
                    </button>
                `;

                cartItemsContainer.appendChild(itemElement);
            });
        }

        cartBadges.forEach(badge => { badge.textContent = totalCount; });
        if (cartTotalElement) cartTotalElement.textContent = `${formatPrice(totalPrice)} руб`;

        saveCart();
        addCartItemsEventListeners();
    }

    function addCartItemsEventListeners() {
        document.querySelectorAll('.cart-item .qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const item = cart.find(i => i.id === id);
                if (item) { item.quantity++; renderCart(); }
            });
        });

        document.querySelectorAll('.cart-item .qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const item = cart.find(i => i.id === id);
                if (item) {
                    if (item.quantity > 1) item.quantity--;
                    else cart = cart.filter(i => i.id !== id);
                    renderCart();
                }
            });
        });

        document.querySelectorAll('.cart-item__remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                cart = cart.filter(i => i.id !== id);
                renderCart();
            });
        });
    }

    function setupAddToCartButtons() {
        document.querySelectorAll('.product-card').forEach((card, index) => {
            const addBtn = card.querySelector('.btn');
            const imgEl = card.querySelector('.product-card__img');

            if (addBtn) {
                addBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const titleEl = card.querySelector('.product-card__title');
                    const priceEl = card.querySelector('.price-current');

                    const product = {
                        id: index + 10,
                        title: titleEl ? titleEl.textContent.trim() : 'Мужская одежда',
                        price: priceEl ? parsePrice(priceEl.textContent) : 4990,
                        image: imgEl ? imgEl.getAttribute('src') : './images/oversize_hoodie_black.jpg',
                        quantity: 1
                    };
                    addToCart(product, addBtn);
                });
            }
        });

        const mainProductAddBtn = document.querySelector('.product-actions .btn--primary');
        if (mainProductAddBtn) {
            mainProductAddBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const titleEl = document.querySelector('.product-details__title');
                const priceEl = document.querySelector('.price-current--large');
                const qtyInput = document.querySelector('.quantity-input');
                const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

                const product = {
                    id: 1,
                    title: titleEl ? titleEl.textContent.trim() : 'OVERSIZE HOODIE URBAN BLACK',
                    price: priceEl ? parsePrice(priceEl.textContent) : 4990,
                    image: './images/oversize_hoodie_black.jpg',
                    quantity: qty
                };
                addToCart(product, mainProductAddBtn);
            });
        }
    }

    function addToCart(product, buttonElement) {
        const existingItem = cart.find(item => item.id === product.id || item.title === product.title);
        if (existingItem) existingItem.quantity += product.quantity;
        else cart.push({ ...product });

        renderCart();

        if (buttonElement) {
            const originalText = buttonElement.textContent;
            buttonElement.classList.add('added-to-cart');
            buttonElement.textContent = 'В КОРЗИНЕ ✓';

            setTimeout(() => {
                buttonElement.classList.remove('added-to-cart');
                buttonElement.textContent = originalText;
            }, 2500);
        }
    }

    function formatPrice(price) { return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
    function parsePrice(priceStr) { return parseInt(priceStr.replace(/[^\d]/g, '')) || 0; }

    renderCart();
    setupAddToCartButtons();
}

function initCartMarkup() {
    if (document.getElementById('cart-drawer')) return;

    const drawerHTML = `
        <div class="cart-overlay" id="cart-overlay"></div>
        <aside class="cart-drawer" id="cart-drawer">
            <div class="cart-drawer__header">
                <div class="cart-drawer__title">
                    <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
                    <h3 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 900; text-transform: uppercase;">Корзина</h3>
                </div>
                <button class="cart-drawer__close" id="cart-close-btn" aria-label="Закрыть">
                    ✕
                </button>
            </div>
            <div class="cart-drawer__body" id="cart-drawer-items"></div>
            <div class="cart-drawer__footer">
                <div class="cart-drawer__total">
                    <span>Итого к оплате:</span>
                    <strong id="cart-total-price">0 руб</strong>
                </div>
                <a href="checkout.html" class="btn btn--primary btn--full btn--large">Оформить заказ</a>
                <a href="cart.html" class="btn btn--secondary btn--full" style="font-size: 0.8rem;">Перейти в полную корзину →</a>
            </div>
        </aside>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHTML);
}

/* ==========================================
   2. СТРАНИЦА ОФОРМЛЕНИЯ ЗАКАЗА (CHECKOUT.HTML СНИМКИ 1 И 2)
   ========================================== */
function initCheckoutPage() {
    const coItemsCount = document.getElementById('co-items-count');
    if (!coItemsCount) return;

    let cart = JSON.parse(localStorage.getItem('hks_cart')) || [];
    let shippingCost = 249;

    const coItemsPrice = document.getElementById('co-items-price');
    const coShippingPrice = document.getElementById('co-shipping-price');
    const coDiscountPrice = document.getElementById('co-discount-price');
    const coFinalTotal = document.getElementById('co-final-total');
    const submitBtn = document.getElementById('final-submit-order-btn');
    const shippingRadios = document.querySelectorAll('input[name="shipping-method"]');

    function calculateCheckout() {
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const itemsTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const finalSum = itemsTotal + shippingCost;

        if (coItemsCount) coItemsCount.textContent = `${totalCount} товара(-ов)`;
        if (coItemsPrice) coItemsPrice.textContent = `${formatPrice(itemsTotal)} руб`;
        if (coShippingPrice) coShippingPrice.textContent = `${formatPrice(shippingCost)} руб`;
        if (coFinalTotal) coFinalTotal.textContent = `${formatPrice(finalSum)} руб`;
    }

    shippingRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            shippingCost = parseInt(e.target.value) || 0;
            calculateCheckout();
        });
    });

    if (submitBtn) {
        submitBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            const firstName = document.getElementById('cust-first-name')?.value.trim();
            const lastName = document.getElementById('cust-last-name')?.value.trim();
            const phone = document.getElementById('cust-phone')?.value.trim();
            const email = document.getElementById('cust-email')?.value.trim();
            const street = document.getElementById('cust-address-street')?.value.trim();

            if (!firstName || !phone || !email) {
                return alert('Пожалуйста, заполните основные поля: Имя, Телефон и Email.');
            }

            try {
                const res = await fetch('/api/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_name: `${firstName} ${lastName || ''}`.trim(),
                        customer_email: email,
                        customer_phone: phone,
                        shipping_address: street || 'г. Москва',
                        items: cart.map(i => ({ product_id: i.id, title: i.title, price: i.price, quantity: i.quantity }))
                    })
                });

                const data = await res.json();
                if (res.ok) {
                    alert(`🎉 Заказ #${data.order_number} успешно подтвержден!\nМы отправили детали заказа на ваш Email: ${email}`);
                    localStorage.removeItem('hks_cart');
                    window.location.href = 'profile.html';
                } else {
                    alert(data.error || 'Ошибка при подтверждении заказа');
                }
            } catch (err) {
                alert('Ошибка соединения с сервером');
            }
        });
    }

    function formatPrice(price) { return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

    calculateCheckout();
}

/* ==========================================
   3. СТРАНИЦА КОРЗИНЫ (CART.HTML) ПО РЕФЕРЕНСУ
   ========================================== */
function initFullCartPage() {
    const listContainer = document.getElementById('full-cart-items-list');
    if (!listContainer) return;

    let cart = JSON.parse(localStorage.getItem('hks_cart')) || [
        {
            id: 1,
            title: "OVERSIZE HOODIE URBAN BLACK",
            category: "STREETWEAR",
            price: 4990,
            image: "./images/oversize_hoodie_black.jpg",
            quantity: 1,
            checked: true
        },
        {
            id: 2,
            title: "CARGO PANTS TACTICAL KHAKI",
            category: "БРЮКИ & КАРГО",
            price: 5490,
            image: "./images/cargo_pants_khaki.jpg",
            quantity: 1,
            checked: true
        }
    ];

    cart.forEach(i => { if (i.checked === undefined) i.checked = true; });

    let discountAmount = 0;
    const freeShippingThreshold = 5000;

    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const selectedCountEl = document.getElementById('selected-count');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const updateCartBtn = document.getElementById('update-cart-btn');

    const shippingFill = document.getElementById('shipping-progress-fill');
    const shippingTruck = document.getElementById('shipping-truck-icon');
    const shippingText = document.getElementById('shipping-progress-text');
    const shippingNeededEl = document.getElementById('shipping-amount-needed');

    const promoInput = document.getElementById('promo-code-input');
    const applyPromoBtn = document.getElementById('apply-promo-btn');

    const summaryItemsCount = document.getElementById('summary-items-count');
    const summaryItemsPrice = document.getElementById('summary-items-price');
    const summaryDiscountPrice = document.getElementById('summary-discount-price');
    const summaryFinalTotal = document.getElementById('summary-final-total');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    function saveCart() {
        localStorage.setItem('hks_cart', JSON.stringify(cart));
    }

    function renderFullCart() {
        listContainer.innerHTML = '';

        if (cart.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 48px 20px; color: var(--color-text-muted);">
                    <p style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 900;">ВАША КОРЗИНА ПУСТА</p>
                    <a href="catalog.html" class="btn btn--primary" style="margin-top: 16px;">Перейти в каталог</a>
                </div>
            `;
        } else {
            cart.forEach((item, index) => {
                const itemRow = document.createElement('div');
                itemRow.className = 'cart-full-item';
                itemRow.innerHTML = `
                    <label class="checkbox-label">
                        <input type="checkbox" class="item-checkbox" data-index="${index}" ${item.checked ? 'checked' : ''}>
                    </label>
                    <img src="${item.image}" alt="${item.title}" class="cart-full-item__img">
                    <div>
                        <div class="cart-full-item__category">${item.category || 'ОДЕЖДА'}</div>
                        <div class="cart-full-item__title">${item.title}</div>
                    </div>
                    <div class="cart-full-item__price">${formatPrice(item.price)} руб</div>
                    <div class="cart-qty-box">
                        <button class="full-qty-btn minus" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="full-qty-btn plus" data-index="${index}">+</button>
                    </div>
                    <div class="cart-full-item__actions">
                        <button class="icon-action-btn delete-item-btn" data-index="${index}" title="Удалить">🗑️</button>
                        <button class="icon-action-btn wishlist-item-btn" title="В избранное">❤️</button>
                    </div>
                `;
                listContainer.appendChild(itemRow);
            });
        }

        saveCart();
        updateCalculations();
        attachEvents();
    }

    function updateCalculations() {
        const checkedItems = cart.filter(i => i.checked);
        const totalItemsCount = checkedItems.reduce((sum, i) => sum + i.quantity, 0);
        const totalItemsPrice = checkedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const finalPrice = Math.max(0, totalItemsPrice - discountAmount);

        if (selectedCountEl) selectedCountEl.textContent = checkedItems.length;
        if (selectAllCheckbox) selectAllCheckbox.checked = cart.length > 0 && cart.every(i => i.checked);

        if (shippingFill && shippingTruck && shippingNeededEl) {
            const percent = Math.min(100, (totalItemsPrice / freeShippingThreshold) * 100);
            shippingFill.style.width = `${percent}%`;
            shippingTruck.style.left = `${percent}%`;

            const needed = Math.max(0, freeShippingThreshold - totalItemsPrice);
            if (needed === 0) {
                if (shippingText) shippingText.innerHTML = `🎉 <strong>Поздравляем!</strong> Вы получили бесплатную доставку!`;
            } else {
                shippingNeededEl.textContent = `${formatPrice(needed)} ₽`;
            }
        }

        if (summaryItemsCount) summaryItemsCount.textContent = `${totalItemsCount} товара(-ов)`;
        if (summaryItemsPrice) summaryItemsPrice.textContent = `${formatPrice(totalItemsPrice)} руб`;
        if (summaryDiscountPrice) summaryDiscountPrice.textContent = `${formatPrice(discountAmount)} руб`;
        if (summaryFinalTotal) summaryFinalTotal.textContent = `${formatPrice(finalPrice)} руб`;
    }

    function attachEvents() {
        document.querySelectorAll('.item-checkbox').forEach(box => {
            box.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                cart[idx].checked = e.target.checked;
                updateCalculations();
            });
        });

        document.querySelectorAll('.full-qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                cart[idx].quantity++;
                renderFullCart();
            });
        });

        document.querySelectorAll('.full-qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                if (cart[idx].quantity > 1) {
                    cart[idx].quantity--;
                } else {
                    cart.splice(idx, 1);
                }
                renderFullCart();
            });
        });

        document.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                cart.splice(idx, 1);
                renderFullCart();
            });
        });
    }

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            cart.forEach(i => i.checked = e.target.checked);
            renderFullCart();
        });
    }

    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', () => {
            cart = cart.filter(i => !i.checked);
            renderFullCart();
        });
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            cart = [];
            renderFullCart();
        });
    }

    if (updateCartBtn) {
        updateCartBtn.addEventListener('click', renderFullCart);
    }

    if (applyPromoBtn && promoInput) {
        applyPromoBtn.addEventListener('click', () => {
            const code = promoInput.value.trim().toUpperCase();
            if (code === 'HKS10' || code === 'SALE10') {
                discountAmount = 1000;
                alert('🎉 Промокод применен! Скидка 1 000 руб');
            } else if (code) {
                alert('Промокод недействителен. Попробуйте HKS10');
            }
            updateCalculations();
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const checkedItems = cart.filter(i => i.checked);
            if (checkedItems.length === 0) return alert('Выберите хотя бы один товар для заказа');
            window.location.href = 'checkout.html';
        });
    }

    function formatPrice(price) { return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

    renderFullCart();
}

/* ==========================================
   4. МОДАЛЬНЫЙ ИНТЕРАКТИВНЫЙ ПОИСК ПО КЛИКУ
   ========================================== */
function initSearchModal() {
    const toggleBtn = document.getElementById('search-toggle-btn');
    const modalOverlay = document.getElementById('search-modal');
    const closeBtn = document.getElementById('search-modal-close');
    const input = document.getElementById('search-modal-input');

    if (!toggleBtn || !modalOverlay) return;

    function openSearch() {
        modalOverlay.classList.add('active');
        if (input) setTimeout(() => input.focus(), 100);
    }

    function closeSearch() { modalOverlay.classList.remove('active'); }

    toggleBtn.addEventListener('click', (e) => { e.preventDefault(); openSearch(); });
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeSearch(); });
}

/* ==========================================
   5. ИНТЕРАКТИВНЫЕ ВЫПАДАЮЩИЕ МЕНЮ ФИЛЬТРОВ
   ========================================== */
function initDropdownFilters() {
    const toggleBtns = document.querySelectorAll('.dropdown-toggle');
    const dropdowns = document.querySelectorAll('.filter-dropdown-menu');

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = btn.dataset.target;
            const targetMenu = document.getElementById(targetId);

            dropdowns.forEach(menu => { if (menu !== targetMenu) menu.classList.remove('active'); });
            toggleBtns.forEach(b => { if (b !== btn) b.classList.remove('active'); });

            if (targetMenu) {
                targetMenu.classList.toggle('active');
                btn.classList.toggle('active');
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.filter-pill-wrapper')) {
            dropdowns.forEach(menu => menu.classList.remove('active'));
            toggleBtns.forEach(btn => btn.classList.remove('active'));
        }
    });
}

/* ==========================================
   6. SEO: TITLE И META DESCRIPTION
   ========================================== */
function initDynamicProductSEO() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (!productId || !document.querySelector('.product-page')) return;

    fetch(`/api/products/${productId}`)
        .then(res => res.json())
        .then(prod => {
            if (!prod || prod.error) return;
            document.title = `${prod.title} – Купить за ${prod.price} руб | HKS MAN`;
            const titleEl = document.querySelector('.product-details__title');
            if (titleEl) titleEl.textContent = prod.title;
            const priceEl = document.querySelector('.price-current--large');
            if (priceEl) priceEl.textContent = `${prod.price} руб`;
        })
        .catch(() => {});
}

/* ==========================================
   7. СЛАЙДЕР
   ========================================== */
function initHeroSlider() {
    const sliderContainer = document.getElementById('hero-slider');
    if (!sliderContainer) return;
    const slides = sliderContainer.querySelectorAll('.slide');
    const dots = sliderContainer.querySelectorAll('.dot');
    if (slides.length === 0) return;

    let currentSlide = 0;
    function goToSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });

    setInterval(() => goToSlide(currentSlide + 1), 4000);
}

/* ==========================================
   8. ФИЛЬТРАЦИЯ
   ========================================== */
function initCatalogFilters() {
    const categoryLinks = document.querySelectorAll('.filter-link[data-category], .filter-pill-btn[data-category]');
    const productCards = document.querySelectorAll('.catalog-content .product-card');
    if (productCards.length === 0) return;

    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const cat = link.dataset.category;
            productCards.forEach(card => {
                if (cat === 'all' || card.dataset.category === cat) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}
