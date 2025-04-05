document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname.toLowerCase();
    let category = "";

    // ✅ Detectar categoría según la ruta
    if (path.includes("mejora-continua.html")) {
        category = "mejora-continua";
    } else if (path.includes("salud-mental.html")) {
        category = "salud-mental";
    }

    // ✅ Validar usuario guardado en localStorage
    let user = null;
    try {
        const userRaw = localStorage.getItem("user");
        if (userRaw) {
            user = JSON.parse(userRaw);
            if (!user.username || !user.role) throw new Error();
        } else {
            throw new Error();
        }
    } catch (error) {
        console.warn("Usuario inválido o no autenticado. Redirigiendo...");
        localStorage.removeItem("user");
        window.location.href = "../login.html";
        return;
    }

    // ✅ Crear usuarios si no existen
    if (!localStorage.getItem("users")) {
        const users = [
            { username: "admin", password: "admin123", role: "admin" },
            { username: "empleado1", password: "empleado123", role: "viewer" },
            { username: "empleado2", password: "empleado123", role: "viewer" }
        ];
        localStorage.setItem("users", JSON.stringify(users));
    }

    // ✅ Cargar videos si estamos en una categoría
    if (category) {
        loadVideos(category, user);
    }
});

// ✅ Cargar videos de la categoría
function loadVideos(category, user) {
    const container = document.getElementById("videos");
    if (!container) return;

    container.innerHTML = "";
    let videos = JSON.parse(localStorage.getItem(category)) || [];

    videos.forEach((video, index) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("video-wrapper");

        const title = document.createElement("p");
        title.classList.add("video-title");
        title.style.color = "black";
        title.textContent = video.name || "Sin título";

        let element;
        if (video.url.includes("youtube.com") || video.url.includes("youtu.be")) {
            element = document.createElement("iframe");
            element.src = video.url;
            element.width = 300;
            element.height = 200;
            element.allowFullscreen = true;

            getYouTubeTitle(video.url, (ytTitle) => {
                title.textContent = ytTitle || "Video de YouTube";
            });
        } else {
            element = document.createElement("video");
            element.src = video.url;
            element.width = 300;
            element.controls = true;
        }

        // ✅ Botón eliminar solo si es admin
        if (user.role === "admin") {
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "🗑 Eliminar";
            deleteBtn.classList.add("delete-button");
            deleteBtn.style.background = "red";
            deleteBtn.style.color = "white";
            deleteBtn.style.marginLeft = "10px";
            deleteBtn.style.cursor = "pointer";
            deleteBtn.onclick = function () {
                deleteVideo(category, index);
            };
            wrapper.appendChild(deleteBtn);
        }

        wrapper.appendChild(title);
        wrapper.appendChild(element);
        container.appendChild(wrapper);
    });
}

// ✅ Obtener título de YouTube
function getYouTubeTitle(url, callback) {
    const id = extractYouTubeID(url);
    if (!id) return callback("Video de YouTube");

    fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`)
        .then(res => res.json())
        .then(data => callback(data.title))
        .catch(() => callback("Video de YouTube"));
}

// ✅ Extraer ID de YouTube
function extractYouTubeID(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*vi=))([^?&]+)/);
    return match ? match[1] : null;
}

// ✅ Subir video
function uploadVideo(category) {
    const fileInput = document.getElementById("videoUpload");
    const youtubeInput = document.getElementById("youtubeUrl");

    if (!fileInput.files.length && !youtubeInput.value) {
        alert("Selecciona un archivo o pega un enlace de YouTube.");
        return;
    }

    if (fileInput.files.length) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            saveVideo(category, e.target.result, file.name);
        };

        reader.readAsDataURL(file);
    } else {
        const url = youtubeInput.value;
        getYouTubeTitle(url, (title) => {
            saveVideo(category, url, title);
        });
    }

    youtubeInput.value = "";
}

// ✅ Guardar video
function saveVideo(category, url, name) {
    let videos = JSON.parse(localStorage.getItem(category)) || [];
    videos.push({ url, name });
    localStorage.setItem(category, JSON.stringify(videos));
    const user = JSON.parse(localStorage.getItem("user"));
    loadVideos(category, user);
}

// ✅ Eliminar video
function deleteVideo(category, index) {
    let videos = JSON.parse(localStorage.getItem(category)) || [];
    if (index >= 0) {
        videos.splice(index, 1);
        localStorage.setItem(category, JSON.stringify(videos));
        const user = JSON.parse(localStorage.getItem("user"));
        loadVideos(category, user);
    }
}
