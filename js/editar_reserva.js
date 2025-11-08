const apiUrl = "https://backreservas.systempiura.com";

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Token no disponible. Debes iniciar sesión.");
        return;
    }

    const headers = {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    };

    const form = document.getElementById('formEditarReserva');
    const mensajeDiv = document.getElementById('mensaje');

    // ID de reserva a editar (prueba estática)
    const reservaId = 1;

    // Cargar reserva actual
    const res = await fetch(`${apiUrl}/api/admin/reservas`, { headers });
    const reservas = await res.json();
    const reserva = reservas.find(r => r.reserva_id === reservaId);

    if (reserva) {
        form.usuario_id.value = reserva.usuario_id;
        form.fecha.value = reserva.fecha;
        form.lugar_id.value = reserva.lugar_id;
        form.fecha_entrada.value = reserva.fecha_entrada;
        form.fecha_salida.value = reserva.fecha_salida;
        form.tipo_embarcacion.value = reserva.tipo_embarcacion;
    }

    // Envío de datos editados
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datos = {
            usuario_id: form.usuario_id.value,
            fecha: form.fecha.value,
            lugar_id: form.lugar_id.value,
            fecha_entrada: form.fecha_entrada.value,
            fecha_salida: form.fecha_salida.value,
            tipo_embarcacion: form.tipo_embarcacion.value
        };

        const response = await fetch(`${apiUrl}/api/admin/reservas/${reservaId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(datos)
        });

        const json = await response.json();
        mensajeDiv.innerText = json.mensaje || json.error || "Respuesta desconocida";
    });
});
