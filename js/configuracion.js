import { apiUrl } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('fecha_entrada').value = new Date().toISOString().split("T")[0];
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    };
    const formCrear = document.getElementById('formReserva');
    const formEditar = document.getElementById('formReservaEditar');

    const tablaReservas = document.getElementById('tabla-reservas');
    const tablaLugares = document.getElementById('tabla-lugares');
    const form = document.getElementById('formReserva');
    let modoEdicion = false;
    let reservaEditandoId = null;

    window.abrirFormularioReserva = () => {
        document.getElementById('formulario-reserva').style.display = 'block';
        document.getElementById('fecha_entrada').value = new Date().toISOString().split("T")[0];
        form.reset();
        const hoy = new Date().toISOString().split("T")[0];
        document.getElementById('fecha_entrada').value = hoy;
        modoEdicion = false;
        reservaEditandoId = null;
    };




    const cargarLugares = async () => {
        const hoy = new Date();
        const fechaInicio = hoy.toISOString().split("T")[0];

        const fin = new Date();
        fin.setDate(hoy.getDate() + 30);  // Mostrar 5 días hacia adelante
        const fechaFin = fin.toISOString().split("T")[0];

        const url = `${apiUrl}/api/disponibilidad?inicio=${fechaInicio}&fin=${fechaFin}`;
        const res = await fetch(url, { headers });

        if (res.status === 401) return cerrarSesionPorToken();

        const lugares = await res.json();

        if (!Array.isArray(lugares)) {
            console.error("Respuesta inesperada:", lugares);
            tablaLugares.innerHTML = `<p>Error al cargar lugares. Ver consola.</p>`;
            return;
        }

        tablaLugares.innerHTML = '<h3>Lugares disponibles por periodo de días</h3>';

        lugares.forEach(l => {
            const div = document.createElement('div');
            div.className = 'tarjeta-lugar';

            let detallesTramos = '';
            if (l.tramos_disponibles.length === 0) {
                detallesTramos = '<li>Sin disponibilidad en este rango de fechas</li>';
            } else {
                detallesTramos = l.tramos_disponibles.map(tramo => {
                    if (tramo.inicio_abierta) {
                        return `<li><strong>Disponible a partir del ${tramo.inicio_abierta}</strong> (total disponibilidad)</li>`;
                    } else {
                        return `<li>Del <strong>${tramo.inicio}</strong> al <strong>${tramo.fin}</strong>: ${tramo.cupos} cupos disponibles</li>`;
                    }
                }).join('');
            }


            div.innerHTML = `
            <p><strong>${l.nombre}</strong></p>
            <p>Capacidad total: ${l.capacidad}</p>
            <ul>${detallesTramos}</ul>
        `;
            tablaLugares.appendChild(div);
        });
    };

    const cargarLugaresSelect = async () => {
        const res = await fetch(`${apiUrl}/api/disponibilidad?inicio=2025-06-14&fin=2025-06-18`, { headers });
        const lugares = await res.json();
        const select = document.getElementById('lugar_id_editar');
        select.innerHTML = '<option value="">-- Seleccione lugar --</option>';

        lugares.forEach(l => {
            const option = document.createElement('option');
            option.value = l.lugar_id;
            option.textContent = l.nombre;
            select.appendChild(option);
        });
    };



    const cargarReservas = async () => {
        const res = await fetch(`${apiUrl}/api/admin/reservas`, { headers });
        if (res.status === 401) return cerrarSesionPorToken();
        const reservas = await res.json();
        tablaReservas.innerHTML = '';
        console.log("📦 Reservas recibidas:", reservas);

        reservas.forEach(r => {
            const div = document.createElement('div');
            div.className = 'tarjeta-lugar';
            div.innerHTML = `
  <p><strong>Usuario:</strong> ${r.usuario}</p>
  <p><strong>Lugar:</strong> ${r.lugar}</p>
  <p><strong>Tipo de embarcación:</strong> ${r.tipo_embarcacion}</p>
  <p><strong>Fecha de reserva:</strong> ${r.fecha}</p>
  <p><strong>Entrada:</strong> ${r.fecha_entrada}</p>
  <p><strong>Salida:</strong> ${r.fecha_salida}</p>
  <p><strong>Servicios requeridos:</strong>
    ${r.requiere_pintura ? '🖌️ Pintura ' : ''}
    ${r.requiere_mecanica ? '🔧 Mecánica ' : ''}
    ${r.requiere_motor ? '⚙️ Motor' : ''}
  </p>
  <button onclick="editarReserva(${r.reserva_id})">✏️ Editar</button>
  <button onclick="eliminarReserva(${r.reserva_id})">🗑️ Eliminar</button>
`;
            tablaReservas.appendChild(div);
        });
    };
    const cargarUsuarios = async () => {
        const res = await fetch(`${apiUrl}/api/admin/usuarios`, { headers });
        const usuarios = await res.json();
        console.log("👀 Usuarios recibidos:", usuarios);

        // Limpia ambos selects
        document.querySelectorAll('select[name="usuario_id"]').forEach(select => {
            select.innerHTML = '<option value="">-- Seleccione usuario --</option>';
            usuarios.forEach(u => {
                const option = document.createElement('option');
                option.value = u.id;
                option.textContent = u.nombre;
                select.appendChild(option);
            });
        });
    };


    formCrear.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datos = {
            usuario_id: formCrear.usuario_id.value,
            lugar_id: formCrear.lugar_id.value,
            tipo_embarcacion: formCrear.tipo_embarcacion.value,
            fecha_entrada: formCrear.fecha_entrada.value,
            fecha_salida: formCrear.fecha_salida.value
        };

        const res = await fetch(`${apiUrl}/api/admin/reservas`, {
            method: 'POST',
            headers,
            body: JSON.stringify(datos)
        });

        const respuesta = await res.json();

        if (!res.ok) {
            alert(respuesta.error || "Error al registrar la reserva");
            return;
        }

        alert(respuesta.mensaje || "Reserva registrada correctamente");
        cerrarFormulario();
        cargarReservas();
    });




    formEditar.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datos = {
            usuario_id: formEditar.usuario_id.value,
            lugar_id: formEditar.lugar_id.value,
            tipo_embarcacion: formEditar.tipo_embarcacion.value,
            fecha_entrada: formEditar.fecha_entrada.value,
            fecha_salida: formEditar.fecha_salida.value,
            requiere_pintura: formEditar.requiere_pintura.checked,
            requiere_mecanica: formEditar.requiere_mecanica.checked,
            requiere_motor: formEditar.requiere_motor.checked
        };

        const url = `${apiUrl}/api/admin/reservas/${reservaEditandoId}`;
        const res = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(datos)
        });

        const respuesta = await res.json();
        alert(respuesta.mensaje || "Actualización exitosa");
        cerrarFormularioReserva();
        cargarReservas();
    });


    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return '';
        const date = new Date(fechaStr);
        if (isNaN(date)) return '';
        return date.toISOString().split('T')[0];
    };

    const cargarLugaresSelectParaCrear = async () => {
        const hoy = new Date();
        const fechaInicio = hoy.toISOString().split("T")[0];

        const fin = new Date();
        fin.setDate(hoy.getDate() + 5);
        const fechaFin = fin.toISOString().split("T")[0];

        const res = await fetch(`${apiUrl}/api/disponibilidad?inicio=${fechaInicio}&fin=${fechaFin}`, { headers });
        const lugares = await res.json();

        const select = document.getElementById('lugar_id_crear');
        select.innerHTML = '<option value="">-- Seleccione lugar --</option>';

        lugares.forEach(l => {
            const option = document.createElement('option');
            option.value = l.lugar_id;
            option.textContent = l.nombre;
            select.appendChild(option);
        });
    };
    window.editarReserva = async (id) => {
        const res = await fetch(`${apiUrl}/api/admin/reservas`, { headers });
        const reservas = await res.json();
        const reserva = reservas.find(r => r.reserva_id === id);
        console.log("🧾 Datos reserva:", reserva);

        if (reserva) {
            formEditar.usuario_id.value = reserva.usuario_id;
            formEditar.lugar_id.value = reserva.lugar_id;
            formEditar.tipo_embarcacion.value = reserva.tipo_embarcacion;
            formEditar.fecha_entrada.value = formatearFecha(reserva.fecha_entrada);
            formEditar.fecha_salida.value = formatearFecha(reserva.fecha_salida);
            formEditar.requiere_pintura.checked = reserva.requiere_pintura;
            formEditar.requiere_mecanica.checked = reserva.requiere_mecanica;
            formEditar.requiere_motor.checked = reserva.requiere_motor;

            document.getElementById('modal-reserva').style.display = 'flex';
            modoEdicion = true;
            reservaEditandoId = id;

        } else {
            alert("No se encontró la reserva.");
        }

    };

    window.cerrarFormularioReserva = () => {
        document.getElementById('modal-reserva').style.display = 'none';
        formEditar.reset();
        modoEdicion = false;
        reservaEditandoId = null;
    };

    window.cerrarFormulario = () => {
        document.getElementById('formulario-reserva').style.display = 'none';
        document.getElementById('formReserva').reset();
        modoEdicion = false;
        reservaEditandoId = null;
    };


    window.eliminarReserva = async (id) => {
        const confirmar = confirm('¿Eliminar esta reserva?');
        if (!confirmar) return;

        const res = await fetch(`${apiUrl}/api/admin/reservas/${id}`, {
            method: 'DELETE',
            headers
        });
        if (res.status === 401) return cerrarSesionPorToken();
        await cargarReservas();
    };

    const cerrarSesionPorToken = () => {
        localStorage.removeItem('token');
        alert('Tu sesión ha expirado. Inicia sesión nuevamente.');
        location.reload();
    };




    const formRegistro = document.getElementById('formRegistroUsuario');
    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();

            const datos = {
                nombre: formRegistro.nombre.value,
                correo: formRegistro.correo.value,
                clave: formRegistro.clave.value
            };

            const res = await fetch(`${apiUrl}/api/registro`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(datos)
            });

            const respuesta = await res.json();
            const mensajeDiv = document.getElementById('mensaje-registro');

            if (res.ok) {
                mensajeDiv.innerText = '✅ Usuario registrado correctamente.';
                formRegistro.reset();
                await cargarUsuarios();
            } else {
                mensajeDiv.innerText = '❌ ' + (respuesta.mensaje || 'Error al registrar');
            }
        });
    } else {
        console.error("❌ No se encontró el formulario de registro en el DOM.");
    }

    await cargarReservas();
    await cargarLugares();
    await cargarUsuarios();
    await cargarLugaresSelect();
    await cargarLugaresSelectParaCrear();
});

