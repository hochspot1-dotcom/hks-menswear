/* ==========================================
   ИНТЕРАКТИВНЫЙ ИНТЕРНЕТ-МАГАЗИН МУЖСКОЙ ОДЕЖДЫ (SCRIPT.JS)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    initHeroSlider();
    initCatalogFilters();
    initSearchModal();
    initDropdownFilters();
    initDynamicProductSEO();
    initFullCartPage();
});

/* ==========================================
   1. СТРАНИЦА КОРЗИНЫ СТРОГО ПО СНИМКУ РЕФЕРЕНСА
   ========================================== */
function initFullCartPage() {
    const listContainer = document.getElementById('full-cart-items-list');
    if (!listContainer) return;

    let cart = [
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

    let discountAmount = 0;
    const freeShippingThreshold = 5000;

    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const selectedCountEl = document.getElementById('selected-count');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const updateCartBtn = document.getElementById('update-cart-btn');

    const dolyamiAmountEl = document.getElementById('dolyami-amount');
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

        // Расчет Долями (1/4 от стоимости)
        if (dolyamiAmountEl) {
            dolyamiAmountEl.textContent = `${formatPrice(Math.round(finalPrice / 4))} ₽`;
        }

        // Расчет бесплатной доставки
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

        // Расчет итогового правого блока корзины
        if (summaryItemsCount) summaryItemsCount.textContent = `${totalItemsCount} товара(-ов)`;
        if (summaryItemsPrice) summaryItemsPrice.textContent = `${formatPrice(totalItemsPrice)} руб`;
        if (summaryDiscountPrice) summaryDiscountPrice.textContent = `${formatPrice(discountAmount)} руб`;
        if (summaryFinalTotal) summaryFinalTotal.textContent = `${formatPrice(finalPrice)} руб`;
    }

    function attachEvents() {
        // Чекбоксы товаров
        document.querySelectorAll('.item-checkbox').forEach(box => {
            box.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                cart[idx].checked = e.target.checked;
                updateCalculations();
            });
        });

        // Плюс/минус количества
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

        // Удаление одиночной позиции
        document.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                cart.splice(idx, 1);
                renderFullCart();
            });
        });
    }

    // Выбрать все
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            cart.forEach(i => i.checked = e.target.checked);
            renderFullCart();
        });
    }

    // Удалить выбранные
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', () => {
            cart = cart.filter(i => !i.checked);
            renderFullCart();
        });
    }

    // Очистить корзину
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            cart = [];
            renderFullCart();
        });
    }

    if (updateCartBtn) {
        updateCartBtn.addEventListener('click', renderFullCart);
    }

    // Промокод
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

    // Оформить заказ
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            const checkedItems = cart.filter(i => i.checked);
            if (checkedItems.length === 0) return alert('Выберите хотя бы один товар для заказа');

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
                        items: checkedItems.map(item => ({ product_id: item.id, title: item.title, price: item.price, quantity: item.quantity }))
                    })
                });

                const data = await res.json();
                if (res.ok) {
                    alert(`🎉 Заказ #${data.order_number} успешно оформлен!\nСумма: ${data.total_amount} руб`);
                    cart = cart.filter(i => !i.checked);
                    renderFullCart();
                } else { alert('Ошибка оформления'); }
            } catch (err) { alert('Ошибка соединения'); }
        });
    }

    function formatPrice(price) { return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

    renderFullCart();
}

/* ==========================================
   2. МОДАЛЬНЫЙ ИНТЕРАКТИВНЫЙ ПОИСК ПО КЛИКУ
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
   3. ИНТЕРАКТИВНЫЕ ВЫПАДАЮЩИЕ МЕНЮ ФИЛЬТРОВ
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
   4. SEO: TITLE И META DESCRIPTION
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
   5. СЛАЙДЕР
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
   6. ФИЛЬТРАЦИЯ
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
