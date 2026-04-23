// 🔒 Protect page
if (!localStorage.getItem("user_id")) {
    window.location.href = "login.html";
}

/* ================= USER NAME ================= */

window.onload = function () {
    const name = localStorage.getItem("user_name");
    if (name) {
        document.getElementById("username").innerText = "Hi, " + name;
    }
};

/* ================= LOGOUT ================= */

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

/* ================= TOAST ================= */

let toastTimeout;

function showToast(message) {
    const existingToast = document.getElementById("toast");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.id = "toast";
    toast.innerText = message;

    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.background = "#333";
    toast.style.color = "#fff";
    toast.style.padding = "10px 20px";
    toast.style.borderRadius = "5px";

    document.body.appendChild(toast);

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.remove(), 2000);
}

/* ================= CART ================= */

let cart = [];

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    displayCart();
    showToast(`${name} added to cart 🛒`);
}

function increaseQty(index) {
    cart[index].quantity++;
    displayCart();
}

function decreaseQty(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        cart.splice(index, 1);
    }
    displayCart();
}

function displayCart() {
    let total = 0;
    let html = "";

    cart.forEach((item, index) => {
        let itemTotal = item.price * item.quantity;

        html += `
        <div>
            <p>${item.name} - ₹${item.price} x ${item.quantity} = ₹${itemTotal}</p>
            <button onclick="increaseQty(${index})">+</button>
            <button onclick="decreaseQty(${index})">-</button>
        </div>
        `;

        total += itemTotal;
    });

    const cartCountEl = document.getElementById("cart-count");
    if (cartCountEl) cartCountEl.innerText = cart.length;

    document.getElementById("cart-items").innerHTML = html;
    document.getElementById("cart-count").innerText = cart.length;
    document.getElementById("total").innerText = "Total: ₹" + total;
}

/* ================= CHECKOUT ================= */

function checkout() {

    if (cart.length === 0) {
        showToast("Cart is empty!");
        return;
    }

    const user_id = localStorage.getItem("user_id");

    let expandedItems = [];

    cart.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
            expandedItems.push({
                name: item.name,
                price: item.price
            });
        }
    });

    fetch("http://localhost:5000/order-new", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id,
            items: expandedItems
        })
    })
    .then(res => res.json())
    .then(data => {
        showToast(`🎉 Order placed! ID: ${data.order_id}`);
        cart = [];
        displayCart();
    })
    .catch(() => showToast("❌ Error placing order"));
}

/* ================= OTHER ================= */

function scrollToMenu() {
    document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
}

function submitForm() {
    showToast("Message sent successfully!");
}