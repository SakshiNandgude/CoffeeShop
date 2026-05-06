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

    // 👉 Initialize search after page loads
    initSearch();
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

    let selectedSize = "Large";
    let selectedExtras = ["Milk", "Sugar"];

    let sizePrice = selectedSize === "Large" ? 30 : 0;
    let extrasPrice = selectedExtras.length * 10;

    const existingItem = cart.find(item =>
        item.name === name &&
        item.size === selectedSize
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            name,
            price,
            quantity: 1,
            size: selectedSize,
            sizePrice: sizePrice,
            extras: selectedExtras,
            extrasPrice: extrasPrice
        });
    }

    displayCart();
    showToast(`${name} (${selectedSize}) added 🛒`);
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

/* ================= DISPLAY CART ================= */

function displayCart(filteredItems = cart) {
    let total = 0;
    let html = "";

    filteredItems.forEach((item, index) => {
        let itemTotal = (item.price + item.sizePrice + item.extrasPrice) * item.quantity;

        html += `
        <div>
        <p>
        ${item.name} (${item.size}) - ₹${item.price}
        + ₹${item.sizePrice} (size)
        + ₹${item.extrasPrice} (extras)
        x ${item.quantity}
        = ₹${itemTotal}
        </p>
        <button onclick="increaseQty(${index})">+</button>
        <button onclick="decreaseQty(${index})">-</button>
        </div>
        `;

        total += itemTotal;
    });

    document.getElementById("cart-items").innerHTML = html;
    document.getElementById("cart-count").innerText = cart.length;
    document.getElementById("total").innerText = "Total: ₹" + total;
}

/* ================= SEARCH ================= */

function initSearch() {
    const searchInput = document.getElementById("search");

    if (!searchInput) return;

    searchInput.addEventListener("keyup", function () {
        let value = this.value.toLowerCase();

        let filtered = cart.filter(item =>
            item.name.toLowerCase().includes(value)
        );

        displayCart(filtered);
    });
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
                price: item.price,
                size: item.size,
                sizePrice: item.sizePrice,
                extras: item.extras,
                extrasPrice: item.extrasPrice
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

        if (!data.order_id) {
            showToast("❌ Order failed");
            return;
        }

        let bill = "🧾 BILL\n\n";

        cart.forEach(item => {
            let itemTotal = (item.price + item.sizePrice + item.extrasPrice) * item.quantity;

            bill += `${item.name} (${item.size}) x ${item.quantity}\n`;
            bill += `₹${item.price} + ₹${item.sizePrice} + ₹${item.extrasPrice} = ₹${itemTotal}\n\n`;
        });

        bill += "---------------------\n";

        let finalTotal = 0;

        cart.forEach(item => {
            finalTotal += (item.price + item.sizePrice + item.extrasPrice) * item.quantity;
        });

        bill += "Total: ₹" + finalTotal;

        alert(bill);

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