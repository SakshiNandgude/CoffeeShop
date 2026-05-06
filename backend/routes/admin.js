const express = require("express");
const router = express.Router();
const mysql = require("mysql");

/* ================= DB CONNECTION ================= */

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "coffee_db"
});

/* ================= DASHBOARD SUMMARY ================= */

router.get("/summary", (req, res) => {

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


/* ================= GET ALL ORDERS ================= */

router.get("/orders", (req, res) => {

    const sql = `
        SELECT o.order_id, o.total_amount, o.created_at, oi.name, oi.quantity
        FROM orders_new o
        JOIN order_items oi ON o.order_id = oi.order_id
        ORDER BY o.created_at DESC
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});


/* ================= GET TODAY ORDERS ================= */

router.get("/orders/today", (req, res) => {

    const sql = `
        SELECT o.order_id, o.total_amount, o.created_at, oi.name, oi.quantity
        FROM orders_new o
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE DATE(o.created_at) = CURDATE()
        ORDER BY o.created_at DESC
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});


/* ================= GET MONTH ORDERS (NEW 🔥) ================= */

router.get("/orders/month", (req, res) => {

    const sql = `
        SELECT o.order_id, o.total_amount, o.created_at, oi.name, oi.quantity
        FROM orders_new o
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE MONTH(o.created_at) = MONTH(CURDATE()) 
        AND YEAR(o.created_at) = YEAR(CURDATE())
        ORDER BY o.created_at DESC
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});


/* ================= FILTER DATA ================= */

router.get("/filter", (req, res) => {

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

    const totalOrdersQuery = `
        SELECT COUNT(*) AS totalOrders 
        FROM orders_new ${dateFilter}
    `;

    const revenueQuery = `
        SELECT SUM(total_amount) AS totalRevenue 
        FROM orders_new ${dateFilter}
    `;

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


/* ================= EXPORT ================= */

module.exports = router;