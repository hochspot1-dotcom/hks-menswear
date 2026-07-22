/* ==========================================
   ИНТЕРАКТИВНЫЙ ИНТЕРНЕТ-МАГАЗИН МУЖСКОЙ ОДЕЖДЫ (SCRIPT.JS)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    initMiniCart();
    initHeroSlider();
    initCatalogFilters();
    initSearchModal();
    initDropdownFilters();
    initDynamicProductSEO();
});

/* ==========================================
   1. МОДАЛЬНЫЙ ИНТЕРАКТИВНЫЙ ПОИСК ПО КЛИКУ НА ИКОНКУ ЛУПЫ
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

    function closeSearch() {
        modalOverlay.classList.remove('active');
    }

    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openSearch();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeSearch);

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeSearch();
    });
}

/* ==========================================
   2. ИНТЕРАКТИВНЫЕ ВЫПАДАЮЩИЕ МЕНЮ ФИЛЬТРОВ КАТАЛОГА (DROPDOWNS)
   ========================================== */
function initDropdownFilters() {
    const toggleBtns = document.querySelectorAll('.dropdown-toggle');
    const dropdowns = document.querySelectorAll('.filter-dropdown-menu');

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = btn.dataset.target;
            const targetMenu = document.getElementById(targetId);

            dropdowns.forEach(menu => {
                if (menu !== targetMenu) menu.classList.remove('active');
            });
            toggleBtns.forEach(b => {
                if (b !== btn) b.classList.remove('active');
            });

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
   3. SEO: ДИНАМИЧЕСКАЯ СМЕНА TITLE И META DESCRIPTION
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
            
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.content = `${prod.title}. ${prod.description || 'Мужская одежда с доставкой по РФ.'}`;
            }

            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) ogTitle.content = prod.title;

            const titleEl = document.querySelector('.product-details__title');
            if (titleEl) titleEl.textContent = prod.title;

            const priceEl = document.querySelector('.price-current--large');
            if (priceEl) priceEl.textContent = `${prod.price} руб`;

            const skuEl = document.querySelector('.sku');
            if (skuEl && prod.sku) skuEl.textContent = `Артикул: ${prod.sku}`;

            const descEl = document.querySelector('.product-details__description');
            if (descEl && prod.description) descEl.textContent = prod.description;
        })
        .catch(() => {});
}

/* ==========================================
   4. АВТОПРОКРУЧИВАЮЩИЙСЯ СЛАЙДЕР БАННЕР
   ========================================== */
function initHeroSlider() {
    const sliderContainer = document.getElementById('hero-slider');
    if (!sliderContainer) return;

    const slides = sliderContainer.querySelectorAll('.slide');
    const dots = sliderContainer.querySelectorAll('.dot');
    if (slides.length === 0) return;

    let currentSlide = 0;
    let timer = null;
    const intervalTime = 4000;

    function goToSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) {
            dots[currentSlide].classList.add('active');
        }
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function startAutoSlide() {
        stopAutoSlide();
        timer = setInterval(nextSlide, intervalTime);
    }

    function stopAutoSlide() {
        if (timer) clearInterval(timer);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            startAutoSlide();
        });
    });

    sliderContainer.addEventListener('mouseenter', stopAutoSlide);
    sliderContainer.addEventListener('mouseleave', startAutoSlide);

    startAutoSlide();
}

/* ==========================================
   5. ФИЛЬТРАЦИЯ ТОВАРОВ В КАТАЛОГЕ
   ========================================== */
function initCatalogFilters() {
    const categoryLinks = document.querySelectorAll('.filter-link[data-category], .filter-pill-btn[data-category]');
    const productCards = document.querySelectorAll('.catalog-content .product-card');
    const resetBtn = document.getElementById('reset-filters-btn');
    const noProductsMsg = document.getElementById('no-products-msg');

    if (productCards.length === 0) return;

    let currentCategory = 'all';

    function filterProducts() {
        let visibleCount = 0;

        productCards.forEach(card => {
            const cardCategory = card.dataset.category;
            const matchCategory = (currentCategory === 'all' || cardCategory === currentCategory);

            if (matchCategory) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (noProductsMsg) {
            noProductsMsg.style.display = (visibleCount === 0) ? 'block' : 'none';
        }
    }

    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            categoryLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            currentCategory = link.dataset.category;
            filterProducts();
        });
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            currentCategory = 'all';
            categoryLinks.forEach(l => l.classList.remove('active'));
            if (categoryLinks[0]) categoryLinks[0].classList.add('active');
            filterProducts();
        });
    }
}

/* ==========================================
   6. МИНИ-КОРЗИНА (DRAWER CART) С УЛУЧШЕННОЙ АНИМАЦИЕЙ КНОПКИ
   ========================================== */
function initMiniCart() {
    let cart = [
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

    function openCart() {
        drawer.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Открытие корзины ТОЛЬКО при клике на иконку корзины в шапке
    cartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openCart();
        });
    });

    closeBtn.addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        
        let totalCount = 0;
        let totalPrice = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty" style="text-align: center; padding: 48px 20px; color: var(--color-text-muted);">
                    <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-bottom: 12px; opacity: 0.5;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
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
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                `;

                cartItemsContainer.appendChild(itemElement);
            });
        }

        cartBadges.forEach(badge => { badge.textContent = totalCount; });
        cartTotalElement.textContent = `${formatPrice(totalPrice)} руб`;

        addCartItemsEventListeners();
    }

    function addCartItemsEventListeners() {
        document.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const item = cart.find(i => i.id === id);
                if (item) { item.quantity++; renderCart(); }
            });
        });

        document.querySelectorAll('.qty-btn.minus').forEach(btn => {
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
        // Добавление из карточек в сетке
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

        // Добавление с главной страницы товара
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

        // Оформление заказа
        const checkoutBtn = document.querySelector('.cart-drawer__footer .btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (cart.length === 0) return alert('Ваша корзина пуста');
                
                const name = prompt('Введите ваше имя:', 'Алексей');
                if (!name) return;
                const phone = prompt('Введите номер телефона:', '+7 (999) 000-00-00');
                if (!phone) return;

                try {
                    const res = await fetch('/api/order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            customer_name: name,
                            customer_email: 'customer@example.com',
                            customer_phone: phone,
                            shipping_address: 'г. Москва, ул. Примерная, д. 10',
                            items: cart.map(item => ({ product_id: item.id, title: item.title, price: item.price, quantity: item.quantity }))
                        })
                    });

                    const data = await res.json();
                    if (res.ok) {
                        alert(`🎉 Заказ #${data.order_number} успешно оформлен!\nИтоговая сумма: ${data.total_amount} руб`);
                        cart = [];
                        renderCart();
                        closeCart();
                    } else { alert(data.error || 'Ошибка при отправке заказа'); }
                } catch (err) { alert('Ошибка соединения с сервером'); }
            });
        }
    }

    // ТРАНСФОРМАЦИЯ КНОПКИ БЕЗ АВТОМАТИЧЕСКОГО ВСКРЫТИЯ КОРЗИНЫ
    function addToCart(product, buttonElement) {
        const existingItem = cart.find(item => item.id === product.id || item.title === product.title);
        if (existingItem) existingItem.quantity += product.quantity;
        else cart.push({ ...product });

        renderCart();

        // Анимация кнопки "В КОРЗИНЕ ✓" без всплытия панели
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
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="cart-drawer__body" id="cart-drawer-items"></div>
            <div class="cart-drawer__footer">
                <div class="cart-drawer__total">
                    <span>Итого к оплате:</span>
                    <strong id="cart-total-price">0 руб</strong>
                </div>
                <button class="btn btn--primary btn--full btn--large">Оформить заказ</button>
            </div>
        </aside>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHTML);
}
