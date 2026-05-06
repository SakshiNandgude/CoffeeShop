const express = require("express");
const router = express.Router();
const mysql = require("mysql");

/* DB CONNECTION (same as server.js) */
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "coffee_db"
});

/* ================= NEW ORDER SYSTEM ================= */

router.post('/place-order', (req, res) => {

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
        let quantity = item.quantity || 1;
        total += base * quantity;
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
            console.log(err);
            return res.status(500).json({ message: "Order failed" });
        }

        const orderId = result.insertId;

        const itemValues = items.map(item => [
            orderId,
            item.name,
            item.price,
            item.quantity || 1,
            item.size || "Medium",
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
                return res.status(500).json({ message: "Item insert failed" });
            }

            res.json({ message: "Order placed successfully" });
        });
    });
});

module.exports = router;