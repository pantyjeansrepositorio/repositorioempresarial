// Usuarios con permisos
const users = {
    "admin": { password: "Panty2025", role: "admin" }, // Puede subir archivos
    "empleado": { password: "empleado123", role: "viewer" } // Solo puede visualizar
};

function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    if (users[username] && users[username].password === password) {
        localStorage.setItem("user", JSON.stringify({ username, role: users[username].role }));
        window.location.href = "index.html"; // Redirigir a la página principal
    } else {
        errorMessage.textContent = "Usuario o contraseña incorrectos.";
    }
}

function checkAuth() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html"; // Si no está autenticado, redirigir a login
    }
}

function logout() {
    localStorage.removeItem("user"); // Eliminar usuario de sesión
    setTimeout(() => {
        window.location.href = "login.html"; // Redirigir al login después de 0.5 segundos
    }, 500);
}

// Llamamos a esta función en cada página donde se necesite autenticación

