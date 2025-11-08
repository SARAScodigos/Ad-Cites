const apiUrl = "https://backreservas.systempiura.com";



window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Acceso denegado. Inicie sesión.');
        window.location.href = 'index.html';
        return;
    }

    try {
        const res = await fetch('http://localhost:5000/api/disponibilidad', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.status === 401) {
            // Token inválido o expirado
            localStorage.removeItem("token");
            alert("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
            window.location.reload(); // recarga para mostrar el login flotante
            return;
        }


        const contenedor = document.getElementById('contenedor-lugares');
        const data = await res.json();

        // 🔍 VER EN CONSOLA LO QUE DEVUELVE EL BACKEND
        console.log("🧪 JSON recibido del backend:", data);

        const lugares = Array.isArray(data) ? data : data.disponibilidad;

        if (!Array.isArray(lugares)) {
            throw new Error("El backend no devolvió una lista válida");
        }

        contenedor.innerHTML = '';
        lugares.forEach(lugar => {
            const card = document.createElement('div');
            card.className = 'tarjeta-lugar';
            card.innerHTML = `
                <h3>${lugar.nombre}</h3>
                <p><strong>Capacidad total:</strong> ${lugar.capacidad}</p>
                <p><strong>Reservas activas hoy:</strong> ${lugar.reservas_activas}</p>
                <p><strong>Disponibles:</strong> ${lugar.capacidad_disponible}</p>
            `;
            contenedor.appendChild(card);
        });

    } catch (err) {
        console.error("❌ Error al cargar los lugares:", err);
        alert("Error al cargar los lugares");
    }
});
