document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('menuLateral');
    toggle.addEventListener('click', () => {
        menu.classList.toggle('visible');
    });
});

