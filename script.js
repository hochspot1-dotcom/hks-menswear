/* ==========================================
   ИНТЕРАКТИВНЫЙ ИНТЕРНЕТ-МАГАЗИН МУЖСКОЙ ОДЕЖДЫ (SCRIPT.JS)
   ========================================== */

// 1. ГЛОБАЛЬНОЕ ХРАНИЛИЩЕ КОРЗИНЫ В LOCALSTORAGE
function getCartFromStorage() {
    try {
        const stored = localStorage.getItem('hks_cart');
        if (stored !== null) {
            return JSON.parse(stored);
        }
    } catch (e) {}
    
    return [
        {
            id: 101,
            title: "OVERSIZE HOODIE URBAN BLACK",
            category: "ХУДИ & СВИТШОТЫ",
            price: 4990,
            image: "./images/oversize_hoodie_black.jpg",
            quantity: 1,
            checked: true
        }
    ];
}

function saveCartToStorage(cartArray) {
    try {
        localStorage.setItem('hks_cart', JSON.stringify(cartArray));
    } catch (e) {}
    updateAllCartBadges(cartArray);
}

function updateAllCartBadges(cartArray) {
    const list = cartArray || getCartFromStorage();
    const totalCount = list.reduce((sum, item) => sum + (item.quantity || 1), 0);
    document.querySelectorAll('.cart-btn__badge').forEach(badge => {
        badge.textContent = totalCount;
    });
}

// Синхронизация между вкладками
window.addEventListener('storage', (e) => {
    if (e.key === 'hks_cart') {
        updateAllCartBadges();
        if (typeof renderFullCartGlobal === 'function') renderFullCartGlobal();
        if (typeof renderMiniCartGlobal === 'function') renderMiniCartGlobal();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    updateAllCartBadges();
    initMobileNav();
    initGlobalCartEvents();
    initMiniCart();
    initFullCartPage();
    initCheckoutPage();
    initHeroSlider();
    initCatalogFilters();
    initSearchModal();
    initDropdownFilters();
    initDynamicProductSEO();
    initSupportWidget();
});

/* ==========================================
   МОБИЛЬНОЕ БУРГЕР-МЕНЮ
   ========================================== */
function initMobileNav() {
    let burger = document.getElementById('burger-menu-btn');
    let drawer = document.getElementById('mobile-nav-drawer');

    if (!burger) {
        const headerContainer = document.querySelector('.header__container');
        if (headerContainer) {
            const btn = document.createElement('button');
            btn.className = 'burger-btn';
            btn.id = 'burger-menu-btn';
            btn.setAttribute('aria-label', 'Меню');
            btn.innerHTML = '<span></span><span></span><span></span>';
            headerContainer.insertBefore(btn, headerContainer.firstChild);
            burger = btn;
        }
    }

    if (!drawer) {
        const navDrawer = document.createElement('aside');
        navDrawer.className = 'mobile-nav-drawer';
        navDrawer.id = 'mobile-nav-drawer';
        navDrawer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="logo">HKS <span class="logo__accent">MAN</span></div>
                <button id="mobile-nav-close" style="background: none; border: none; font-size: 1.4rem; cursor: pointer;">✕</button>
            </div>
            <a href="index.html">Главная</a>
            <a href="catalog.html">Каталог одежды</a>
            <a href="catalog.html?cat=hoodie">Худи & Свитшоты</a>
            <a href="catalog.html?cat=tshirt">Футболки</a>
            <a href="catalog.html?cat=pants">Брюки & Карго</a>
            <a href="cart.html">Корзина</a>
            <a href="profile.html">Личный кабинет</a>
        `;
        document.body.appendChild(navDrawer);
        drawer = navDrawer;
    }

    const closeBtn = document.getElementById('mobile-nav-close');

    if (burger && drawer) {
        burger.addEventListener('click', () => drawer.classList.add('active'));
        if (closeBtn) closeBtn.addEventListener('click', () => drawer.classList.remove('active'));
    }
}

/* ==========================================
   ГЛОБАЛЬНЫЙ ДЕЛЕГАТ КЛИКОВ "В КОРЗИНУ"
   ========================================== */
function initGlobalCartEvents() {
    function handleAddToCart(btn, e) {
        if (!btn) return;

        if (btn.tagName === 'A' || btn.hasAttribute('href')) {
            const href = btn.getAttribute('href') || '';
            if (href.includes('.html')) {
                return;
            }
        }

        const btnText = btn.textContent.trim().toLowerCase();
        const isAddBtn = (btnText === 'в корзину' || btnText === 'добавить в корзину');

        if (isAddBtn && !btnText.includes('перейти')) {
            if (e) e.preventDefault();

            const card = btn.closest('.product-card') || btn.closest('.product-page') || btn.closest('.product-details');
            
            let title = 'OVERSIZE HOODIE URBAN BLACK';
            let category = 'МУЖСКАЯ ОДЕЖДА';
            let price = 4990;
            let image = './images/oversize_hoodie_black.jpg';
            let qty = 1;

            if (card) {
                const titleEl = card.querySelector('.product-card__title') || card.querySelector('.product-details__title');
                if (titleEl) title = titleEl.textContent.trim();

                const catEl = card.querySelector('.product-card__category');
                if (catEl) category = catEl.textContent.trim();

                const priceEl = card.querySelector('.price-current') || card.querySelector('.price-current--large');
                if (priceEl) price = parsePrice(priceEl.textContent);

                const imgEl = card.querySelector('.product-card__img') || card.querySelector('.product-gallery__main img');
                if (imgEl) image = imgEl.getAttribute('src');

                const qtyInput = card.querySelector('.quantity-input');
                if (qtyInput) qty = parseInt(qtyInput.value) || 1;
            }

            const product = {
                id: Date.now(),
                title,
                category,
                price,
                image,
                quantity: qty,
                checked: true
            };

            let cart = getCartFromStorage();
            const existing = cart.find(i => i.title === product.title);
            if (existing) {
                existing.quantity += product.quantity;
                existing.checked = true;
            } else {
                cart.push(product);
            }

            saveCartToStorage(cart);

            const oldText = btn.textContent;
            btn.classList.add('added-to-cart');
            btn.textContent = 'В КОРЗИНЕ ✓';
            setTimeout(() => {
                btn.classList.remove('added-to-cart');
                btn.textContent = oldText;
            }, 2500);

            if (typeof renderMiniCartGlobal === 'function') renderMiniCartGlobal();
            if (typeof renderFullCartGlobal === 'function') renderFullCartGlobal();
        }
    }

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn') || e.target.closest('button');
        if (btn) handleAddToCart(btn, e);
    });
}

function parsePrice(str) { return parseInt(str.replace(/[^\d]/g, '')) || 4990; }
function formatPrice(price) { return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

let renderMiniCartGlobal = null;
let renderFullCartGlobal = null;

/* ==========================================
   2. БОКОВАЯ ВЫЕЗЖАЮЩАЯ КОРЗИНА
   ========================================== */
function initMiniCart() {
    initCartMarkup();

    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    const closeBtn = document.getElementById('cart-close-btn');
    const cartBtns = document.querySelectorAll('.cart-btn');
    const cartItemsContainer = document.getElementById('cart-drawer-items');
    const cartTotalElement = document.getElementById('cart-total-price');

    function openCart() {
        if (drawer && overlay) {
            renderCart();
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
        const cart = getCartFromStorage();
        cartItemsContainer.innerHTML = '';
        
        let totalPrice = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty" style="text-align: center; padding: 48px 20px; color: var(--color-text-muted);">
                    <p style="font-family: var(--font-heading); font-size: 0.95rem; font-weight: 800;">Ваша корзина пока пуста</p>
                    <a href="catalog.html" class="btn btn--primary" style="margin-top: 16px; font-size: 0.75rem;">В каталог</a>
                </div>
            `;
        } else {
            cart.forEach(item => {
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
                            <button class="qty-btn minus" data-title="${item.title}">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn plus" data-title="${item.title}">+</button>
                        </div>
                    </div>
                    <button class="cart-item__remove" data-title="${item.title}">✕</button>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }

        if (cartTotalElement) cartTotalElement.textContent = `${formatPrice(totalPrice)} руб`;
        updateAllCartBadges(cart);
        attachMiniCartEvents();
    }

    renderMiniCartGlobal = renderCart;

    function attachMiniCartEvents() {
        document.querySelectorAll('.cart-item .qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const title = e.currentTarget.dataset.title;
                const cart = getCartFromStorage();
                const item = cart.find(i => i.title === title);
                if (item) {
                    item.quantity++;
                    saveCartToStorage(cart);
                    renderCart();
                }
            });
        });

        document.querySelectorAll('.cart-item .qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const title = e.currentTarget.dataset.title;
                let cart = getCartFromStorage();
                const item = cart.find(i => i.title === title);
                if (item) {
                    if (item.quantity > 1) item.quantity--;
                    else cart = cart.filter(i => i.title !== title);
                    saveCartToStorage(cart);
                    renderCart();
                }
            });
        });

        document.querySelectorAll('.cart-item__remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const title = e.currentTarget.dataset.title;
                let cart = getCartFromStorage().filter(i => i.title !== title);
                saveCartToStorage(cart);
                renderCart();
            });
        });
    }

    renderCart();
}

function initCartMarkup() {
    if (document.getElementById('cart-drawer')) return;

    const drawerHTML = `
        <div class="cart-overlay" id="cart-overlay"></div>
        <aside class="cart-drawer" id="cart-drawer">
            <div class="cart-drawer__header">
                <div class="cart-drawer__title">
                    <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
                    <h3 style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 900; text-transform: uppercase;">Корзина</h3>
                </div>
                <button class="cart-drawer__close" id="cart-close-btn" aria-label="Закрыть">✕</button>
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
   3. ПОЛНАЯ СТРАНИЦА КОРЗИНЫ (БЕЗ ЭМОДЗИ, СО СТРОГИМИ SVG)
   ========================================== */
function initFullCartPage() {
    const listContainer = document.getElementById('full-cart-items-list');
    if (!listContainer) return;

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

    function renderFullCart() {
        const cart = getCartFromStorage();
        listContainer.innerHTML = '';

        if (cart.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align: center; padding: 48px 20px; color: var(--color-text-muted);">
                    <p style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 900; margin-bottom: 12px;">ВАША КОРЗИНА ПУСТА</p>
                    <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
                </div>
            `;
        } else {
            cart.forEach((item, index) => {
                const itemRow = document.createElement('div');
                itemRow.className = 'cart-full-item';
                itemRow.innerHTML = `
                    <label class="checkbox-label">
                        <input type="checkbox" class="item-checkbox" data-index="${index}" ${item.checked !== false ? 'checked' : ''}>
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
                        <button class="icon-action-btn delete-item-btn" data-index="${index}" title="Удалить">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                        <button class="icon-action-btn wishlist-item-btn" title="В избранное">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        </button>
                    </div>
                `;
                listContainer.appendChild(itemRow);
            });
        }

        updateCalculations();
        attachEvents();
    }

    renderFullCartGlobal = renderFullCart;

    function updateCalculations() {
        const cart = getCartFromStorage();
        const checkedItems = cart.filter(i => i.checked !== false);
        const totalItemsCount = checkedItems.reduce((sum, i) => sum + i.quantity, 0);
        const totalItemsPrice = checkedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const finalPrice = Math.max(0, totalItemsPrice - discountAmount);

        if (selectedCountEl) selectedCountEl.textContent = checkedItems.length;
        if (selectAllCheckbox) selectAllCheckbox.checked = cart.length > 0 && cart.every(i => i.checked !== false);

        if (shippingFill && shippingTruck && shippingNeededEl) {
            const percent = Math.min(100, (totalItemsPrice / freeShippingThreshold) * 100);
            shippingFill.style.width = `${percent}%`;
            shippingTruck.style.left = `${percent}%`;

            const needed = Math.max(0, freeShippingThreshold - totalItemsPrice);
            if (needed === 0) {
                if (shippingText) shippingText.innerHTML = `Поздравляем! Вы получили бесплатную доставку Почтой России!`;
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
                const cart = getCartFromStorage();
                if (cart[idx]) cart[idx].checked = e.target.checked;
                saveCartToStorage(cart);
                updateCalculations();
            });
        });

        document.querySelectorAll('.full-qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                const cart = getCartFromStorage();
                if (cart[idx]) cart[idx].quantity++;
                saveCartToStorage(cart);
                renderFullCart();
            });
        });

        document.querySelectorAll('.full-qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                let cart = getCartFromStorage();
                if (cart[idx]) {
                    if (cart[idx].quantity > 1) cart[idx].quantity--;
                    else cart.splice(idx, 1);
                }
                saveCartToStorage(cart);
                renderFullCart();
            });
        });

        document.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                let cart = getCartFromStorage();
                cart.splice(idx, 1);
                saveCartToStorage(cart);
                renderFullCart();
            });
        });
    }

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const cart = getCartFromStorage();
            cart.forEach(i => i.checked = e.target.checked);
            saveCartToStorage(cart);
            renderFullCart();
        });
    }

    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', () => {
            let cart = getCartFromStorage().filter(i => i.checked === false);
            saveCartToStorage(cart);
            renderFullCart();
        });
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            saveCartToStorage([]);
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
                alert('Промокод применен! Скидка 1 000 руб');
            } else if (code) {
                alert('Промокод недействителен. Попробуйте HKS10');
            }
            updateCalculations();
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = getCartFromStorage();
            const checkedItems = cart.filter(i => i.checked !== false);
            if (checkedItems.length === 0) return alert('Выберите хотя бы один товар для заказа');
            window.location.href = 'checkout.html';
        });
    }

    renderFullCart();
}

/* ==========================================
   4. ОФОРМЛЕНИЕ ЗАКАЗА (CHECKOUT.HTML)
   ========================================== */
function initCheckoutPage() {
    const coItemsCount = document.getElementById('co-items-count');
    if (!coItemsCount) return;

    let cart = getCartFromStorage();
    let shippingCost = 249;

    const coItemsPrice = document.getElementById('co-items-price');
    const coShippingPrice = document.getElementById('co-shipping-price');
    const coDiscountPrice = document.getElementById('co-discount-price');
    const coFinalTotal = document.getElementById('co-final-total');
    const submitBtn = document.getElementById('final-submit-order-btn');
    const shippingRadios = document.querySelectorAll('input[name="shipping-method"]');

    function calculateCheckout() {
        const checkedCart = cart.filter(i => i.checked !== false);
        const totalCount = checkedCart.reduce((sum, item) => sum + item.quantity, 0);
        const itemsTotal = checkedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
                const checkedItems = cart.filter(i => i.checked !== false);
                const res = await fetch('/api/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_name: `${firstName} ${lastName || ''}`.trim(),
                        customer_email: email,
                        customer_phone: phone,
                        shipping_address: street || 'г. Москва',
                        items: checkedItems.map(i => ({ product_id: i.id, title: i.title, price: i.price, quantity: i.quantity }))
                    })
                });

                const data = await res.json();
                if (res.ok) {
                    alert(`Заказ #${data.order_number} успешно подтвержден!\nДетали отправлены на Email: ${email}`);
                    saveCartToStorage([]);
                    window.location.href = 'profile.html';
                } else {
                    alert(data.error || 'Ошибка при подтверждении заказа');
                }
            } catch (err) {
                alert('Ошибка соединения с сервером');
            }
        });
    }

    calculateCheckout();
}

/* ==========================================
   5. ВИДДЖЕТ ПОДДЕРЖКИ БЕЗ ЭМОДЗИ
   ========================================== */
function initSupportWidget() {
    if (document.getElementById('nks-support-root')) return;

    const widgetHTML = `
        <div class="nks-support-widget" id="nks-support-root">
            <div class="nks-support-badge">Служба поддержки HKS</div>
            <button class="nks-support-btn" id="nks-support-toggle" aria-label="Чат поддержки">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            </button>
        </div>

        <div class="support-modal-overlay" id="support-modal">
            <div class="support-modal-card">
                <div class="support-modal-header">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="support-avatar-online">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                        </div>
                        <div>
                            <h4 style="font-family: var(--font-heading); font-size: 0.95rem; color: #ffffff;">ПОДДЕРЖКА HKS MAN</h4>
                            <span style="font-size: 0.72rem; color: #4ade80;">● Онлайн</span>
                        </div>
                    </div>
                    <button id="support-modal-close" style="background: none; border: none; color: #ffffff; font-size: 1.2rem; cursor: pointer;">✕</button>
                </div>
                <div class="support-modal-body">
                    <p style="font-size: 0.88rem; color: var(--color-text-main); margin-bottom: 16px;">
                        Нужна помощь с выбором размера, заказом или доставкой? Свяжитесь с нами:
                    </p>
                    <a href="https://t.me/" target="_blank" class="support-channel-btn telegram-btn">
                        Написать в Telegram
                    </a>
                    <a href="https://wa.me/" target="_blank" class="support-channel-btn whatsapp-btn">
                        Написать в WhatsApp
                    </a>
                    <a href="tel:88005553535" class="support-channel-btn phone-btn">
                        Позвонить 8 (800) 555-35-35
                    </a>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    const toggleBtn = document.getElementById('nks-support-toggle');
    const supportModal = document.getElementById('support-modal');
    const closeBtn = document.getElementById('support-modal-close');

    if (toggleBtn && supportModal) {
        toggleBtn.addEventListener('click', () => supportModal.classList.add('active'));
        if (closeBtn) closeBtn.addEventListener('click', () => supportModal.classList.remove('active'));
        supportModal.addEventListener('click', (e) => {
            if (e.target === supportModal) supportModal.classList.remove('active');
        });
    }
}

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
