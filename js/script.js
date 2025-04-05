document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;
    let category = "";

    if (path.includes("mejora-continua.html")) {
        category = "mejora-continua";
    } else if (path.includes("salud-mental.html")) {
        category = "salud-mental";
    }

    if (category) {
        loadVideos(category);
    }

    // Cargar usuarios si no existen
    if (!localStorage.getItem("users")) {
        const users = [
            { username: "admin", password: "admin123", role: "admin" },
            { username: "empleado1", password: "empleado123", role: "viewer" },
            { username: "empleado2", password: "empleado123", role: "viewer" }
        ];
        localStorage.setItem("users", JSON.stringify(users));
    }

    // Mostrar botones de login rápido si no hay sesión
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.username) {
        const loginContainer = document.createElement("div");
        loginContainer.id = "quick-login";
        loginContainer.innerHTML = `
            <button onclick="loginAs('admin')">Ingresar como Admin</button>
            <button onclick="loginAs('empleado1')">Ingresar como Empleado</button>
        `;
        document.body.insertBefore(loginContainer, document.body.firstChild);
    }
});

// 🔹 Cargar videos
function loadVideos(category) {
    const videoContainer = document.getElementById("videos");
    if (!videoContainer) return;

    videoContainer.innerHTML = ""; // Limpiar contenido previo
    let videos = JSON.parse(localStorage.getItem(category)) || [];
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    videos.forEach((video, index) => {
        const videoWrapper = document.createElement("div");
        videoWrapper.classList.add("video-wrapper");

        // 🔹 Título del video
        const videoTitle = document.createElement("p");
        videoTitle.textContent = video.name ? video.name : "Sin título";
        videoTitle.classList.add("video-title");
        videoTitle.style.color = "black";

        // 🔹 YouTube o archivo local
        let videoElement;
        if (video.url.includes("youtube.com") || video.url.includes("youtu.be")) {
            videoElement = document.createElement("iframe");
            videoElement.src = video.url;
            videoElement.width = 300;
            videoElement.height = 200;
            videoElement.allowFullscreen = true;

            getYouTubeTitle(video.url, (title) => {
                videoTitle.textContent = title || "Video de YouTube";
            });
        } else {
            videoElement = document.createElement("video");
            videoElement.src = video.url;
            videoElement.controls = true;
            videoElement.width = 300;
        }

        // 🔹 Botón eliminar si es admin
        if (user && user.role === "admin") {
            const deleteButton = document.createElement("button");
            deleteButton.innerHTML = "🗑 Eliminar";
            deleteButton.classList.add("delete-button");
            deleteButton.style.background = "red";
            deleteButton.style.color = "white";
            deleteButton.style.marginLeft = "10px";
            deleteButton.style.border = "none";
            deleteButton.style.cursor = "pointer";
            deleteButton.onclick = function () {
                deleteVideo(category, index);
            };
            videoWrapper.appendChild(deleteButton);
        }

        videoWrapper.appendChild(videoTitle);
        videoWrapper.appendChild(videoElement);
        videoContainer.appendChild(videoWrapper);
    });
}

// 🔹 Obtener título de YouTube
function getYouTubeTitle(url, callback) {
    const videoId = extractYouTubeID(url);
    if (!videoId) {
        callback("Video de YouTube");
        return;
    }

    fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`)
        .then(response => response.json())
        .then(data => {
            callback(data.title);
        })
        .catch(() => {
            callback("Video de YouTube");
        });
}

// 🔹 Extraer ID de YouTube
function extractYouTubeID(url) {
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*vi=))([^?&]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}

// 🔹 Subir videos
function uploadVideo(category) {
    const fileInput = document.getElementById("videoUpload");
    const youtubeInput = document.getElementById("youtubeUrl");

    if (!fileInput.files.length && !youtubeInput.value) {
        alert("Por favor, selecciona un archivo o ingresa un enlace de YouTube.");
        return;
    }

    let fileName = "Sin título";
    let videoUrl = "";

    if (fileInput.files.length) {
        const file = fileInput.files[0];
        fileName = file.name;
        const reader = new FileReader();

        reader.onload = function (event) {
            videoUrl = event.target.result;
            saveVideo(category, videoUrl, fileName);
        };

        reader.readAsDataURL(file);
    } else {
        videoUrl = youtubeInput.value;
        getYouTubeTitle(videoUrl, (title) => {
            saveVideo(category, videoUrl, title);
        });
    }

    youtubeInput.value = "";
}

// 🔹 Guardar en localStorage
function saveVideo(category, url, name) {
    let videos = JSON.parse(localStorage.getItem(category)) || [];
    videos.push({ url: url, name: name });
    localStorage.setItem(category, JSON.stringify(videos));
    loadVideos(category);
}

// 🔹 Eliminar video
function deleteVideo(category, index) {
    let videos = JSON.parse(localStorage.getItem(category)) || [];
    if (index >= 0 && index < videos.length) {
        videos.splice(index, 1);
        localStorage.setItem(category, JSON.stringify(videos));
        loadVideos(category);
    }
}

// 🔹 Función para login rápido
function loginAs(username) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === username);

    if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        location.reload();
    } else {
        alert("Usuario no encontrado");
    }
}

