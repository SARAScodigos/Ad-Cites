import { apiUrl } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const hoy = new Date().toISOString().slice(0, 10);
    const fin = new Date(Date.now() + 86400000).toISOString().slice(0, 10); // mañana

    try {
        const res = await fetch(`${apiUrl}/api/disponibilidad?inicio=${hoy}&fin=${fin}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (res.status === 401) {
            localStorage.removeItem("token");
            alert("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
            window.location.reload();
            return;
        }

        const lugares = await res.json();
        const contenedor = document.getElementById('contenedor-lugares');
        contenedor.innerHTML = '';

        lugares.forEach(lugar => {
            const card = document.createElement('div');
            card.className = 'tarjeta-lugar';

            let detallesDisponibilidad = '';
            if (lugar.tramos_disponibles && lugar.tramos_disponibles.length > 0) {
                detallesDisponibilidad = lugar.tramos_disponibles.map(tramo => {
                    if (tramo.inicio_abierta) {
                        return `<li>Disponible a partir del ${tramo.inicio_abierta} (total disponibilidad)</li>`;
                    } else {
                        return `<li>Del ${tramo.inicio} al ${tramo.fin}: ${tramo.cupos} cupos disponibles</li>`;
                    }
                }).join('');
            } else {
                detallesDisponibilidad = '<li>No hay disponibilidad en este período</li>';
            }

            // Visualización gráfica de ocupación actual
            const total = parseInt(lugar.capacidad || 0);
            const ocupadas = total - (lugar.tramos_disponibles?.[0]?.cupos || 0);
            const libres = total - ocupadas;

            let casillas = '';
            for (let i = 0; i < total; i++) {
                casillas += `<div class="casilla ${i < ocupadas ? 'ocupada' : 'libre'}"></div>`;
            }

            card.innerHTML = `
                <h3>${lugar.nombre || 'Sin nombre'}</h3>
                <p><strong>Capacidad total:</strong> ${total} cupos</p>
                <p><strong>Ocupados:</strong> ${ocupadas}</p>
                <p><strong>Disponibles:</strong> ${libres}</p>
                <div class="casillas">${casillas}</div>
                <div class="detalles-disponibilidad">
                    <h4>Disponibilidad por períodos:</h4>
                    <ul>${detallesDisponibilidad}</ul>
                </div>
            `;

            contenedor.appendChild(card);
        });
    } catch (err) {
        console.error("❌ Error al cargar los lugares:", err);
        alert("Error al cargar los lugares. Por favor, intenta de nuevo más tarde.");
    }
});

// Mostrar formulario solo si es admin
async function mostrarFormularioSiAdmin() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const res = await fetch(`${apiUrl}/api/usuario/info`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (data.rol_id === 2) { // 2 = admin
            document.getElementById('formCrearLugar').style.display = 'block';
        }
    } catch (e) { }
}
mostrarFormularioSiAdmin();

// Crear lugar (solo admin)
document.getElementById('formCrearLugar').addEventListener('submit', async function (e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const nombre = document.getElementById('nombreLugar').value;
    const capacidad = document.getElementById('capacidadLugar').value;
    const zona = document.getElementById('zonaLugar').value;

    try {
        const res = await fetch(`${apiUrl}/api/admin/lugares`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre,
                capacidad,
                zona
            })
        });
        if (res.ok) {
            alert('Lugar creado correctamente');
            location.reload();
        } else {
            const data = await res.json();
            alert('Error: ' + (data.error || data.mensaje));
        }
    } catch (err) {
        alert('Error al crear lugar');
    }
});
