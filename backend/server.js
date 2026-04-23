const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(cors());
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
    } else {
        console.log("✅ MySQL Connected");
    }
});

/* ================= ROUTES ================= */

// Test route
app.get('/', (req, res) => {
    res.send("Backend is running 🚀");
});

/* ================= USER REGISTER ================= */
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.query(sql, [name, email, password], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Registration failed" });
        }

        res.json({ message: "User registered successfully" });
    });
});


// LOGIN
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Login error" });
        }

        if (results.length === 0) {
            return res.json({ message: "Invalid credentials" });
        }

        const user = results[0];

        res.json({
            user_id: user.user_id,
            name: user.name
        });
    });
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
        total += item.price * (item.quantity || 1);
    });

    const orderSql = `
        INSERT INTO orders_new 
        (user_id, total_amount, status, payment_method, payment_status)
        VALUES (?, ?, ?, ?, ?)
    `;

    const orderValues = [
        user_id,
        total,
        "completed",
        "UPI",
        "paid"
    ];

    db.query(orderSql, orderValues, (err, result) => {
        if (err) {
            console.log("❌ Order Insert Error:", err);
            return res.status(500).json({ message: "Order creation failed" });
        }

        const orderId = result.insertId;

        const itemValues = items.map(item => [
            orderId,
            item.name,
            item.price,
            item.quantity || 1
        ]);

        const itemSql = `
            INSERT INTO order_items 
            (order_id, name, price, quantity)
            VALUES ?
        `;

        db.query(itemSql, [itemValues], (err2) => {
            if (err2) {
                console.log("❌ Item Insert Error:", err2);
                return res.status(500).json({ message: "Items insert failed" });
            }

            console.log(`✅ Order #${orderId} created`);

            res.json({
                message: "Order placed successfully",
                order_id: orderId
            });
        });
    });
});

/* ================= OLD ORDER SYSTEM (KEEP FOR BACKUP) ================= */

app.post('/order', (req, res) => {

    const items = req.body.items;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
    }

    const values = items.map(item => [item.name, item.price]);

    const sql = "INSERT INTO orders (name, price) VALUES ?";

    db.query(sql, [values], (err) => {
        if (err) {
            console.log("❌ DB Insert Error:", err);
            return res.status(500).json({ message: "Error saving order" });
        }

        res.status(200).json({ message: "Order placed successfully" });
    });
});

/* ================= GET ORDERS ================= */

app.get('/orders', (req, res) => {
    const sql = "SELECT * FROM orders";

    db.query(sql, (err, result) => {
        if (err) {
            console.log("❌ Fetch Error:", err);
            return res.status(500).json({ message: "Error fetching orders" });
        }

        res.status(200).json(result);
    });
});

/* ================= START SERVER ================= */

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});