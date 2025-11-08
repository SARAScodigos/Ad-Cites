// LOGIN
const apiUrl = "https://backreservas.systempiura.com";

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const correo = e.target.correo.value;
    const clave = e.target.clave.value;

    const res = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, clave }),
    });
    if (res.status === 401) {
        // Token inválido o expirado
        localStorage.removeItem("token");
        alert("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
        window.location.reload(); // recarga para mostrar el login flotante
        return;
    }
    const data = await res.json();
    if (res.ok) {
        localStorage.setItem('token', data.access_token);
        window.location.href = 'dashboard.html';
    } else {
        alert(data.mensaje || 'Error en el login');
    }



});

// REGISTRO
document.getElementById('registroForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = e.target.nombre.value;
    const correo = e.target.correo.value;
    const clave = e.target.clave.value;

    const token = localStorage.getItem('token');

    const res = await fetch(`${apiUrl}/api/registro`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ nombre, correo, clave }),
    });

    if (res.status === 401) {
        // Token inválido o expirado
        localStorage.removeItem("token");
        alert("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
        window.location.reload(); // recarga para mostrar el login flotante
        return;
    }


    const data = await res.json();
    if (res.ok) {
        alert('Usuario registrado correctamente');
        window.location.href = 'dashboard.html';
    } else {
        alert(data.mensaje || 'Error en el registro');
    }

});
