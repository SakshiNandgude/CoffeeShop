// ================= LOGIN =================
function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);

        if (!data.user_id) {
            alert(data.message);
            return;
        }

        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("user_name", data.name);

        alert("Login successful!");
        window.location.href = "index.html";
    })
    .catch(() => {
        alert("Server not working");
    });
}


// ================= REGISTER =================
function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    if (!name || !email || !password) {
        alert("Please fill all fields!");
        return;
    }

    fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
    })
    .then(res => res.json())
    .then(data => {
        console.log("REGISTER RESPONSE:", data);

        // ❌ registration failed
        if (data.message !== "User registered successfully") {
            alert(data.message || "Registration failed");
            return;
        }

        // ✅ success
        alert("Registration successful!");
        window.location.href = "login.html";
    })
    .catch(err => {
        console.error("REGISTER ERROR:", err);
        alert("Registration failed. Check backend.");
    });
}