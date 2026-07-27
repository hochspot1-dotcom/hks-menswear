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
   5. ВИДДЖЕТ ПОДДЕРЖКИ С АНИМАЦИЕЙ И ССЫЛКАМИ
   ========================================== */
function initSupportWidget() {
    // Удаляем старые статические виджеты если есть в HTML, чтобы исключить дублирование
    document.querySelectorAll('.nks-support-widget:not(#nks-support-root)').forEach(el => el.remove());

    if (document.getElementById('nks-support-root')) return;

    const widgetHTML = `
        <div class="nks-support-widget" id="nks-support-root">
            <div class="nks-support-badge" id="nks-support-badge">
                <span class="online-pulse-dot"></span>
                <span>Есть вопросы? Напишите нам! 💬</span>
            </div>
            <button class="nks-support-btn" id="nks-support-toggle" aria-label="Чат поддержки">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            </button>
        </div>

        <div class="support-modal-overlay" id="support-modal">
            <div class="support-modal-card">
                <div class="support-modal-header">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; background-color: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff;">
                            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                        </div>
                        <div>
                            <h4 style="font-family: var(--font-heading); font-size: 0.95rem; color: #ffffff; margin: 0;">ПОДДЕРЖКА HKS MAN</h4>
                            <span style="font-size: 0.72rem; color: #4ade80; display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                                <span class="online-pulse-dot"></span> Онлайн • Отвечаем за 2 мин
                            </span>
                        </div>
                    </div>
                    <button id="support-modal-close" class="support-modal-close-btn" aria-label="Закрыть">✕</button>
                </div>
                <div class="support-modal-body">
                    <p style="font-size: 0.88rem; color: var(--color-text-main); margin-bottom: 16px; line-height: 1.5;">
                        Нужна помощь с выбором размера, заказом или доставкой? Выберите удобный способ связи:
                    </p>
                    <a href="https://t.me/" target="_blank" rel="noopener" class="support-channel-btn telegram-btn">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.66-2.89 8.01-3.45 3.81-1.58 4.6-.1.86 4.6.1.86z"/></svg>
                        Написать в Telegram
                    </a>
                    <a href="https://wa.me/78005553535" target="_blank" rel="noopener" class="support-channel-btn whatsapp-btn">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.82 14.15c-.25.7-1.46 1.34-2.02 1.41-.53.07-1.2.1-3.47-.83-2.9-1.19-4.77-4.14-4.92-4.33-.14-.19-1.18-1.57-1.18-3 0-1.43.74-2.13 1.01-2.42.27-.29.59-.36.79-.36.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.07.92 2.22.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.17-.31.38-.45.51-.15.15-.3.31-.13.6.17.29.77 1.27 1.65 2.05 1.13 1 2.08 1.31 2.37 1.46.29.15.46.13.63-.07.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.34.07.12.07.7-.18 1.4z"/></svg>
                        Написать в WhatsApp
                    </a>
                    <a href="tel:88005553535" class="support-channel-btn phone-btn">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                        Позвонить 8 (800) 555-35-35
                    </a>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    const toggleBtn = document.getElementById('nks-support-toggle');
    const badgeBtn = document.getElementById('nks-support-badge');
    const supportModal = document.getElementById('support-modal');
    const closeBtn = document.getElementById('support-modal-close');

    function openModal() {
        if (supportModal) supportModal.classList.add('active');
    }

    if (toggleBtn) toggleBtn.addEventListener('click', openModal);
    if (badgeBtn) badgeBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', () => supportModal.classList.remove('active'));
    if (supportModal) {
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
    const dots   = sliderContainer.querySelectorAll('.dot');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const bgImg   = document.getElementById('slider-bg-img');

    if (slides.length === 0) return;

    let currentSlide = 0;
    let autoTimer = null;

    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

        currentSlide = (index + slides.length) % slides.length;

        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');

        // Меняем фоновое изображение если задан data-img
        if (bgImg) {
            const imgSrc = slides[currentSlide].dataset.img;
            if (imgSrc) {
                bgImg.style.opacity = '0';
                setTimeout(() => {
                    bgImg.src = imgSrc;
                    bgImg.style.opacity = '';
                }, 250);
            }
        }
    }

    function startAuto() {
        clearInterval(autoTimer);
        autoTimer = setInterval(() => goToSlide(currentSlide + 1), 4500);
    }

    // Стрелки
    if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); startAuto(); });

    // Точки
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => { goToSlide(index); startAuto(); });
    });

    // Свайп на мобильных
    let touchStartX = 0;
    sliderContainer.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    sliderContainer.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
            startAuto();
        }
    }, { passive: true });

    startAuto();
}

function initCatalogFilters() {
    const grid = document.getElementById('catalog-products-grid');
    if (!grid) return;

    // --- ПАРСИНГ URL-ПАРАМЕТРОВ ПЕРЕХОДА (например catalog.html?cat=hoodie) ---
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    if (catParam) {
        const catChecks = document.querySelectorAll('#dropdown-cat input[type=checkbox]');
        let matched = false;
        catChecks.forEach(c => {
            if (c.value === catParam || catParam.includes(c.value) || c.value.includes(catParam)) {
                c.checked = true;
                matched = true;
            } else {
                c.checked = false;
            }
        });
        if (!matched) {
            catChecks.forEach(c => c.checked = true);
        }
    }

    // Сброс
    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            // Поставить все чекбоксы категорий в true
            grid.querySelectorAll('.product-card').forEach(c => c.style.display = '');
            const catChecks = document.querySelectorAll('#dropdown-cat input[type=checkbox]');
            catChecks.forEach(c => c.checked = true);
            const sortNew = document.querySelector('#dropdown-sort input[value=new]');
            if (sortNew) sortNew.checked = true;
            applyFilters();
        });
    }

    // Применение фильтров
    function applyFilters() {
        const cards = Array.from(grid.querySelectorAll('.product-card'));

        // --- Фильтр по КАТЕГОРИИ ---
        const checkedCats = Array.from(
            document.querySelectorAll('#dropdown-cat input[type=checkbox]:checked')
        ).map(c => c.value);

        // --- Сортировка ---
        const sortVal = document.querySelector('#dropdown-sort input[type=radio]:checked')?.value || 'new';

        // Показываем / скрываем
        let visible = cards.filter(card => {
            const cat = card.dataset.category || '';
            return checkedCats.length === 0 || checkedCats.some(c => cat.includes(c));
        });

        // Сортировка видимых карточек
        if (sortVal === 'asc') {
            visible.sort((a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price));
        } else if (sortVal === 'desc') {
            visible.sort((a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price));
        }
        // 'new' — оставляем как в DOM (порядок добавления)

        // Скрываем все
        cards.forEach(c => { c.style.display = 'none'; c.style.order = ''; });

        // Показываем и расставляем order
        visible.forEach((c, i) => {
            c.style.display = '';
            c.style.order = i;
        });

        const noMsg = document.getElementById('no-products-msg');
        if (noMsg) noMsg.style.display = visible.length === 0 ? 'block' : 'none';
    }

    // Вешаем обработчики на все чекбоксы и radio
    document.querySelectorAll('.filter-dropdown-menu input').forEach(inp => {
        inp.addEventListener('change', applyFilters);
    });

    // Устанавливаем grid как flex с order support
    grid.style.display = 'grid';

    applyFilters();
}
