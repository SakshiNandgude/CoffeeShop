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
        console.log("LOGIN RESPONSE:", data);

        // ❌ invalid login
        if (!data.user_id) {
            alert(data.message || "Invalid login");
            return;
        }

        // ✅ store user
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("user_name", data.name);

        // ✅ redirect
        window.location.href = "index.html";
    })
    .catch(err => {
        console.error(err);
        alert("Server error. Check backend.");
    });
}


function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

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

        alert("Registered successfully!");

        // ✅ redirect to login
        window.location.href = "login.html";
    })
    .catch(err => {
        console.error(err);
        alert("Registration failed");
    });
}