const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

// Подключение к PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/store_db',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const authCodes = new Map();

let mockProducts = [
    { id: 1, title: "OVERSIZE HOODIE URBAN BLACK", slug: "oversize-hoodie-urban-black", price: 4990.00, sku: "HKSM-H01", description: "Мужское оверсайз худи из плотного 100% хлопкового флиса премиального качества (460 г/м²).", is_active: true, updated_at: new Date().toISOString() },
    { id: 2, title: "CARGO PANTS TACTICAL KHAKI", slug: "cargo-pants-tactical-khaki", price: 5490.00, sku: "HKSM-P02", description: "Брюки карго из прочного хлопка с глубокими накладными карманами.", is_active: true, updated_at: new Date().toISOString() },
    { id: 3, title: "HEAVY COTTON T-SHIRT WHITE", slug: "heavy-cotton-tshirt-white", price: 2290.00, sku: "HKSM-T03", description: "Плотная мужская футболка 240г прямого кроя.", is_active: true, updated_at: new Date().toISOString() }
];

let mockUsers = [
    { id: 1, email: "user@example.com", first_name: "Анна", phone: "+7 (999) 123-45-67" }
];

let mockOrders = [
    {
        id: 1,
        order_number: "ORD-982341",
        customer_name: "Анна",
        customer_email: "user@example.com",
        customer_phone: "+7 (999) 123-45-67",
        shipping_address: "г. Москва, ул. Арбат, д. 12",
        total_amount: 569,
        status: "Принят",
        created_at: new Date().toISOString(),
        items: [
            { product_name: "MINI PACK WITCHPEACHARTY 21", price: 131, quantity: 1 },
            { product_name: "SUGAR MINI PACK COFFEE TIME 3", price: 219, quantity: 2 }
        ]
    }
];

/* ==========================================
   SEO: ГЕНЕРАЦИЯ SITEMAP.XML И ROBOTS.TXT
   ========================================== */

app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        let productList = mockProducts;

        try {
            const dbRes = await pool.query('SELECT id, slug, updated_at FROM products WHERE is_active = TRUE');
            if (dbRes.rows.length > 0) productList = dbRes.rows;
        } catch (e) {}

        const productUrls = productList.map(p => `
    <url>
        <loc>${baseUrl}/product.html?id=${p.id}</loc>
        <lastmod>${p.updated_at ? new Date(p.updated_at).toISOString() : new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`).join('');

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/catalog.html</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>${productUrls}
</urlset>`;

        res.type('application/xml');
        res.send(xml);
    } catch (err) {
        res.status(500).send('Ошибка генерации Sitemap');
    }
});

/* ==========================================
   1. АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ ПО E-MAIL
   ========================================== */

app.post('/api/auth/send-code', (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Укажите корректный E-mail' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    authCodes.set(email.toLowerCase(), { code, expires: Date.now() + 10 * 60 * 1000 });

    console.log(`\n📩 [EMAIL STUB] Код для ${email}: ${code}\n`);

    res.json({
        message: 'Код отправлен на почту!',
        dev_code: code
    });
});

app.post('/api/auth/verify-code', async (req, res) => {
    const { email, code } = req.body;
    const lowerEmail = email.toLowerCase();
    const saved = authCodes.get(lowerEmail);

    if (!saved || saved.code !== code || Date.now() > saved.expires) {
        return res.status(400).json({ error: 'Неверный или просроченный код' });
    }

    authCodes.delete(lowerEmail);

    try {
        let user;
        try {
            const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [lowerEmail]);
            if (userRes.rows.length === 0) {
                const newRes = await pool.query(
                    `INSERT INTO users (email, first_name, password_hash) VALUES ($1, $2, $3) RETURNING *`,
                    [lowerEmail, lowerEmail.split('@')[0], 'auth_via_code']
                );
                user = newRes.rows[0];
            } else {
                user = userRes.rows[0];
            }
        } catch (dbErr) {
            user = mockUsers.find(u => u.email === lowerEmail);
            if (!user) {
                user = { id: Date.now(), email: lowerEmail, first_name: lowerEmail.split('@')[0], phone: '+7 (999) 000-00-00' };
                mockUsers.push(user);
            }
        }

        res.json({
            message: 'Успешная авторизация!',
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name || 'Покупатель',
                phone: user.phone || ''
            },
            token: `token_${user.id}_${Date.now()}`
        });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка авторизации' });
    }
});

/* ==========================================
   2. ЛИЧНЫЙ КАБИНЕТ И ИСТОРИЯ ЗАКАЗОВ
   ========================================== */

app.get('/api/user/orders', async (req, res) => {
    const email = (req.query.email || '').toLowerCase();
    if (!email) return res.status(400).json({ error: 'Укажите email' });

    try {
        try {
            const ordersRes = await pool.query(
                `SELECT * FROM orders WHERE LOWER(customer_email) = $1 ORDER BY id DESC`,
                [email]
            );
            const orders = ordersRes.rows;
            for (let order of orders) {
                const itemsRes = await pool.query(`SELECT * FROM order_items WHERE order_id = $1`, [order.id]);
                order.items = itemsRes.rows;
            }
            return res.json(orders);
        } catch (dbErr) {
            const userOrders = mockOrders.filter(o => o.customer_email.toLowerCase() === email);
            return res.json(userOrders);
        }
    } catch (err) {
        res.status(500).json({ error: 'Ошибка загрузки истории заказов' });
    }
});

/* ==========================================
   3. КЛИЕНТСКИЕ МАРШРУТЫ (ТОВАРЫ И ЗАКАЗ)
   ========================================== */

app.get('/api/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const offset = (page - 1) * limit;

        try {
            const countResult = await pool.query('SELECT COUNT(*) FROM products WHERE is_active = TRUE');
            const totalProducts = parseInt(countResult.rows[0].count);

            const productsResult = await pool.query(
                `SELECT p.*, c.name as category_name FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE p.is_active = TRUE ORDER BY p.id DESC LIMIT $1 OFFSET $2`,
                [limit, offset]
            );

            return res.json({ total: totalProducts, page, totalPages: Math.ceil(totalProducts / limit), data: productsResult.rows });
        } catch (dbErr) {
            return res.json({ total: mockProducts.length, page, totalPages: 1, data: mockProducts });
        }
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        try {
            const result = await pool.query(
                `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1 AND p.is_active = TRUE`,
                [productId]
            );
            if (result.rows.length === 0) return res.status(404).json({ error: 'Товар не найден' });
            return res.json(result.rows[0]);
        } catch (dbErr) {
            const product = mockProducts.find(p => p.id === productId);
            if (!product) return res.status(404).json({ error: 'Товар не найден' });
            return res.json(product);
        }
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/order', async (req, res) => {
    try {
        const { customer_name, customer_email, customer_phone, shipping_address, notes, items } = req.body;
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

        try {
            const client = await pool.connect();
            await client.query('BEGIN');
            const orderRes = await client.query(
                `INSERT INTO orders (order_number, total_amount, customer_name, customer_email, customer_phone, shipping_address, notes, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                [orderNumber, totalAmount, customer_name, customer_email, customer_phone, shipping_address || 'Самовывоз', notes || '', 'Принят']
            );
            const orderId = orderRes.rows[0].id;

            for (const item of items) {
                await client.query(
                    `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, total_price)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [orderId, item.product_id || null, item.title, item.price, item.quantity, item.price * item.quantity]
                );
            }
            await client.query('COMMIT');
            client.release();

            return res.status(201).json({ message: 'Заказ создан!', order_number: orderNumber, order_id: orderId, total_amount: totalAmount });
        } catch (dbErr) {
            const newOrder = {
                id: Date.now(),
                order_number: orderNumber,
                customer_name,
                customer_email,
                customer_phone,
                shipping_address,
                total_amount: totalAmount,
                status: 'Принят',
                created_at: new Date().toISOString(),
                items: items.map(i => ({ product_name: i.title, price: i.price, quantity: i.quantity }))
            };
            mockOrders.unshift(newOrder);
            return res.status(201).json({ message: 'Заказ создан (Демо)', order_number: orderNumber, total_amount: totalAmount });
        }
    } catch (err) {
        res.status(500).json({ error: 'Ошибка оформления заказа' });
    }
});

/* ==========================================
   4. АДМИН-ПАНЕЛЬ: СТАТУСЫ ЗАКАЗОВ И CRUD
   ========================================== */

app.get('/api/admin/orders', async (req, res) => {
    try {
        try {
            const ordersRes = await pool.query('SELECT * FROM orders ORDER BY id DESC');
            const orders = ordersRes.rows;
            for (let order of orders) {
                const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
                order.items = itemsRes.rows;
            }
            return res.json(orders);
        } catch (dbErr) {
            return res.json(mockOrders);
        }
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.put('/api/admin/orders/:id/status', async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;

        try {
            const result = await pool.query(
                `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
                [status, orderId]
            );
            if (result.rows.length === 0) return res.status(404).json({ error: 'Заказ не найден' });
            return res.json({ message: 'Статус заказа обновлен', order: result.rows[0] });
        } catch (dbErr) {
            const order = mockOrders.find(o => o.id === orderId);
            if (!order) return res.status(404).json({ error: 'Заказ не найден' });
            order.status = status;
            return res.json({ message: 'Статус обновлен (Демо)', order });
        }
    } catch (err) {
        res.status(500).json({ error: 'Ошибка изменения статуса' });
    }
});

app.get('/api/admin/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.json(mockProducts);
    }
});

app.post('/api/admin/products', async (req, res) => {
    try {
        const { title, price, old_price, description, sku } = req.body;
        const slug = title.toLowerCase().replace(/[^a-z0-9а-я]/g, '-');
        try {
            const result = await pool.query(
                `INSERT INTO products (title, slug, price, old_price, description, sku) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [title, slug, price, old_price || null, description || '', sku || `SKU-${Date.now()}`]
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            const p = { id: Date.now(), title, slug, price: parseFloat(price), sku: sku || `SKU-${Date.now()}` };
            mockProducts.unshift(p);
            res.status(201).json(p);
        }
    } catch (err) { res.status(500).json({ error: 'Ошибка добавления' }); }
});

app.put('/api/admin/products/:id/price', async (req, res) => {
    try {
        const { price } = req.body;
        try {
            const result = await pool.query(`UPDATE products SET price = $1 WHERE id = $2 RETURNING *`, [price, req.params.id]);
            res.json(result.rows[0]);
        } catch (err) {
            const p = mockProducts.find(x => x.id === parseInt(req.params.id));
            if (p) p.price = parseFloat(price);
            res.json(p);
        }
    } catch (err) { res.status(500).json({ error: 'Ошибка изменения цены' }); }
});

app.delete('/api/admin/products/:id', async (req, res) => {
    try {
        try {
            await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
            res.json({ message: 'Удалено' });
        } catch (err) {
            mockProducts = mockProducts.filter(x => x.id !== parseInt(req.params.id));
            res.json({ message: 'Удалено' });
        }
    } catch (err) { res.status(500).json({ error: 'Ошибка удаления' }); }
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
    console.log(`🗺️ Sitemap: http://localhost:${PORT}/sitemap.xml`);
    console.log(`🤖 Robots.txt: http://localhost:${PORT}/robots.txt`);
});
