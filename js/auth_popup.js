import { apiUrl } from './config.js';

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const estado = document.getElementById("estadoCuenta");

    if (estado) {
        estado.innerHTML = token
            ? '<a href="cuenta.html" style="color:white;text-decoration:none;">👤 Mi cuenta</a>'
            : '<span id="abrirLogin" style="cursor:pointer;">👤 Iniciar sesión</span>';
    }

    document.addEventListener("click", (e) => {
        if (e.target.id === "abrirLogin") {
            document.getElementById("loginOverlay").classList.add("visible");
        } else if (e.target.id === "cerrarOverlay") {
            document.getElementById("loginOverlay").classList.remove("visible");
        }
    });

    const loginForm = document.getElementById("formLoginMini");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const correo = e.target.correo.value;
            const clave = e.target.clave.value;

            const res = await fetch(`${apiUrl}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, clave }),
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("token", data.access_token);
                document.getElementById("loginOverlay").classList.remove("visible");
                location.reload();
            } else {
                alert(data.mensaje || "Credenciales inválidas");
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    // 👇 Ocultar enlaces si NO hay token
    if (!token) {
        document.querySelectorAll("a[href='servicios.html'], a[href='configuracion.html'], a[href='cuenta.html']").forEach(link => {
            link.style.display = "none";
        });
    }

    // 👤 Estado del usuario arriba a la derecha
    const estado = document.getElementById("estadoCuenta");
    if (estado) {
        estado.innerHTML = token
            ? '<span style="cursor:pointer;">👤 Mi cuenta</span>'
            : '<span id="abrirLogin" style="cursor:pointer;">👤 Iniciar sesión</span>';
    }

    // Mostrar modal de login
    document.addEventListener("click", (e) => {
        if (e.target.id === "abrirLogin") {
            document.getElementById("loginOverlay").classList.add("visible");
        } else if (e.target.id === "cerrarOverlay") {
            document.getElementById("loginOverlay").classList.remove("visible");
        }
    });

    // Procesar login
    const loginForm = document.getElementById("formLoginMini");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const correo = e.target.correo.value;
            const clave = e.target.clave.value;

            const res = await fetch(`${apiUrl}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, clave }),
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("token", data.access_token);
                document.getElementById("loginOverlay").classList.remove("visible");

                // 🔁 Mostrar links antes ocultos
                document.querySelectorAll("a[href='servicios.html'], a[href='configuracion.html'], a[href='cuenta.html']").forEach(link => {
                    link.style.display = "block";
                });

                location.reload();  // refresca para aplicar el nuevo estado
            } else {
                alert(data.mensaje || "Credenciales inválidas");
            }
        });
    }
});
