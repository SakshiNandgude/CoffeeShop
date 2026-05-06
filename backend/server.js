const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(cors({
    origin: "http://127.0.0.1:5500"
}));
app.use(express.json());

/* ================= DATABASE CONNECTION ================= */

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'coffee_db'
});

db.connect(err => {
    if (err) {
        console.log("❌ DB Error:", err);
        process.exit(1);
    } else {
        console.log("✅ MySQL Connected");
    }
});

/* ================= TEST ================= */

app.get('/', (req, res) => {
    res.send("Backend is running 🚀");
});

/* ================= ROUTES ================= */

const orderRoutes = require("./routes/order");
const adminRoutes = require("./routes/admin");

app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

/* ================= USER REGISTER ================= */

app.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields required" });
    }

    db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, password],
        (err) => {
            if (err) {
                console.log("REGISTER ERROR:", err);

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ message: "Email already exists" });
                }

                return res.status(500).json({ message: err.message });
            }

            res.json({ message: "User registered successfully" });
        }
    );
});

/* ================= LOGIN ================= */

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    console.log("LOGIN TRY:", email, password);

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, results) => {

            if (err) {
                console.log("LOGIN ERROR:", err);
                return res.json({ message: "Database error" });
            }

            if (results.length === 0) {
                return res.json({ message: "User not found" });
            }

            const user = results[0];

            console.log("DB USER:", user);

            if (user.password !== password) {
                return res.json({ message: "Wrong password" });
            }

            res.json({
                user_id: user.user_id,
                name: user.name
            });
        }
    );
});

/* ================= NEW ORDER SYSTEM ================= */

app.post('/order-new', (req, res) => {

    const { items, user_id } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
    }

    if (!user_id) {
        return res.status(400).json({ message: "User not logged in" });
    }

    let total = 0;

    items.forEach(item => {
        let base = item.price || 0;
        let sizeCost = item.sizePrice || 0;
        let extrasCost = item.extrasPrice || 0;
        let quantity = item.quantity || 1;
        total += (base + sizeCost + extrasCost) * quantity;
    });

    const orderSql = `
        INSERT INTO orders_new 
        (user_id, total_amount, status, payment_method, payment_status)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(orderSql, [user_id, total, "completed", "UPI", "paid"], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: err.message });
        }

        const orderId = result.insertId;

        const itemValues = items.map(item => [
            orderId,
            item.name,
            item.price,
            item.quantity || 1,
            item.size || 'Medium',
            JSON.stringify(item.extras || [])
        ]);

        const itemSql = `
            INSERT INTO order_items 
            (order_id, name, price, quantity, size, extras)
            VALUES ?
        `;

        db.query(itemSql, [itemValues], (err2) => {
            if (err2) {
                console.log(err2);
                return res.status(500).json({ message: err2.message });
            }

            res.json({
                message: "Order placed successfully",
                order_id: orderId
            });
        });
    });
});

/* ================= DASHBOARD ================= */

app.get("/dashboard", (req, res) => {

    const totalOrdersQuery = "SELECT COUNT(*) AS totalOrders FROM orders_new";
    const revenueQuery = "SELECT SUM(total_amount) AS totalRevenue FROM orders_new";

    const topItemQuery = `
        SELECT name, SUM(quantity) AS count
        FROM order_items
        GROUP BY name
        ORDER BY count DESC
        LIMIT 1
    `;

    db.query(totalOrdersQuery, (err1, ordersResult) => {
        if (err1) return res.status(500).json(err1);

        db.query(revenueQuery, (err2, revenueResult) => {
            if (err2) return res.status(500).json(err2);

            db.query(topItemQuery, (err3, topItemResult) => {
                if (err3) return res.status(500).json(err3);

                res.json({
                    totalOrders: ordersResult[0].totalOrders,
                    totalRevenue: revenueResult[0].totalRevenue || 0,
                    topItem: topItemResult[0]?.name || "-"
                });
            });
        });
    });
});

/* ================= FILTER DASHBOARD ================= */

app.get("/dashboard-filter", (req, res) => {

    const { type } = req.query;

    let dateFilter = "";

    if (type === "daily") {
        dateFilter = "WHERE DATE(created_at) = CURDATE()";
    } 
    else if (type === "monthly") {
        dateFilter = `
            WHERE MONTH(created_at) = MONTH(CURDATE()) 
            AND YEAR(created_at) = YEAR(CURDATE())
        `;
    }

    const totalOrdersQuery = `SELECT COUNT(*) AS totalOrders FROM orders_new ${dateFilter}`;
    const revenueQuery = `SELECT SUM(total_amount) AS totalRevenue FROM orders_new ${dateFilter}`;

    db.query(totalOrdersQuery, (err1, ordersResult) => {
        if (err1) return res.status(500).json(err1);

        db.query(revenueQuery, (err2, revenueResult) => {
            if (err2) return res.status(500).json(err2);

            res.json({
                totalOrders: ordersResult[0].totalOrders,
                totalRevenue: revenueResult[0].totalRevenue || 0
            });
        });
    });
});

/* ================= START SERVER ================= */

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});