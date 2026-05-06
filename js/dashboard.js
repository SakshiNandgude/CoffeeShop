const BASE_URL = "http://localhost:5000";

console.log("Dashboard JS Loaded ✅");

/* LOAD ALL DATA */
function loadDashboard() {

    fetch(`${BASE_URL}/api/admin/summary`)
    .then(res => res.json())
    .then(data => {
        document.getElementById("orders").innerText = data.totalOrders;
        document.getElementById("revenue").innerText = data.totalRevenue;
        document.getElementById("topItem").innerText = data.topItem;
    })
    .catch(err => console.log("Error:", err));

    loadOrders("all");
}


/* FILTER DATA */
function filterData(type) {

    fetch(`${BASE_URL}/api/admin/filter?type=${type}`)
    .then(res => res.json())
    .then(data => {
        document.getElementById("orders").innerText = data.totalOrders;
        document.getElementById("revenue").innerText = data.totalRevenue;
    })
    .catch(err => console.log("Error:", err));

    loadOrders(type);
}


/* LOAD ORDERS */
function loadOrders(type) {
    let url = `${BASE_URL}/api/admin/orders`;

    if (type === "daily") {
        url = `${BASE_URL}/api/admin/orders/today`;
    } 
    else if (type === "monthly") {
        url = `${BASE_URL}/api/admin/orders/month`;
    }

    fetch(url)
    .then(res => res.json())
    .then(data => renderTable(data))
    .catch(err => console.log("Error loading orders:", err));
}


/* RENDER TABLE */
function renderTable(orders) {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";

    if (!orders || orders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5">No orders found</td></tr>`;
        return;
    }

    orders.forEach(order => {
        const row = `
            <tr>
                <td>${order.order_id}</td>
                <td>${order.name}</td>
                <td>${order.quantity}</td>
                <td>₹${order.total_amount}</td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}


/* BUTTON ACTIVE */
function setActive(button) {
    const buttons = document.querySelectorAll(".filters button");
    buttons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
}


/* AUTO LOAD */
window.onload = () => {
    loadDashboard();
};