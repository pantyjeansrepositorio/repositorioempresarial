document.addEventListener("DOMContentLoaded", function () {
    const dropArea = document.getElementById("drop-area");
    const fileInput = document.getElementById("fileElem");
    const fileList = document.getElementById("file-list");

    if (!dropArea || !fileInput || !fileList) {
        console.error("❌ Elementos necesarios no encontrados en el DOM.");
        return;
    }

    // Evitar comportamiento por defecto al arrastrar archivos
    ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => e.preventDefault(), false);
    });

    // Agregar clase de resaltado al arrastrar
    dropArea.addEventListener("dragover", () => {
        dropArea.style.backgroundColor = "#d9edf7";
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.style.backgroundColor = "#f1f1f1";
    });

    // Manejar archivos soltados
    dropArea.addEventListener("drop", (e) => {
        dropArea.style.backgroundColor = "#f1f1f1";
        let files = e.dataTransfer.files;
        handleFiles(files);
    });

    // Cuando el usuario hace clic en el área para seleccionar archivos
    dropArea.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        for (let file of files) {
            let listItem = document.createElement("div");
            listItem.className = "file-item";
            listItem.textContent = `📂 ${file.name}`;
            fileList.appendChild(listItem);
        }
    }
});

function addYoutubeVideo() {
    let youtubeInput = document.getElementById("youtubeInput");
    let youtubeList = document.getElementById("youtube-list");

    if (!youtubeInput || !youtubeList) {
        console.error("❌ Elementos del formulario de YouTube no encontrados.");
        return;
    }

    let videoUrl = youtubeInput.value.trim();
    let videoId = extractYoutubeID(videoUrl);

    if (!videoId) {
        alert("❌ Ingresa un enlace válido de YouTube.");
        return;
    }

    // Construir miniatura y título del video
    let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
    let fullVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    fetch(`https://noembed.com/embed?url=${fullVideoUrl}`)
        .then(response => response.json())
        .then(data => {
            let videoTitle = data.title || "Video de YouTube";

            // Crear el elemento de video
            let videoItem = document.createElement("div");
            videoItem.classList.add("video-item");

            videoItem.innerHTML = `
                <a href="${fullVideoUrl}" target="_blank">
                    <img src="${thumbnailUrl}" alt="Miniatura de ${videoTitle}">
                    <p>${videoTitle}</p>
                </a>
            `;

            // Agregar a la lista de videos
            youtubeList.appendChild(videoItem);

            // Limpiar el input
            youtubeInput.value = "";
        })
        .catch(error => {
            console.error("❌ Error al obtener el título del video:", error);
            alert("⚠️ No se pudo obtener la información del video.");
        });
}

// Función para extraer el ID de un video de YouTube desde diferentes formatos de URL
function extractYoutubeID(url) {
    let regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    let match = url.match(regex);
    return match ? match[1] : null;
}



