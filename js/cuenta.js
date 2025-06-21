document.addEventListener("DOMContentLoaded", () => {
    // Cerrar sesión
    const cerrar = document.getElementById("cerrarSesion");
    if (cerrar) {
        cerrar.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "index.html";
        });
    }

    // Mostrar información del usuario
    const infoDiv = document.getElementById("infoUsuario");
    const token = localStorage.getItem("token");

    if (token && infoDiv) {
        fetch('http://localhost:5000/api/usuario/info', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(res => {
                if (!res.ok) throw new Error('Error al obtener los datos');
                return res.json();
            })
            .then(data => {
                const inicial = data.nombre ? data.nombre.charAt(0).toUpperCase() : '?';
                infoDiv.innerHTML = `
            <div class="user-card">
                <div class="user-avatar">${inicial}</div>
                <div class="user-details">
                    <h2>${data.nombre}</h2>
                    <p><i class="fas fa-envelope"></i> ${data.correo}</p>
                    <p><i class="fas fa-user-tag"></i> <span class="role-badge">${data.rol}</span></p>
                </div>
            </div>
            `;
            })
            .catch(() => {
                infoDiv.innerHTML = '<p class="error-message">No se pudo cargar la información del usuario.</p>';
            });
    } else {
        infoDiv.innerHTML = '<p class="error-message">No has iniciado sesión.</p>';
    }
});