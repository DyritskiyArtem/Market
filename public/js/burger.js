document.addEventListener('DOMContentLoaded', (event) => {
    const burger = document.querySelector('.burger');
    const navMenu = document.querySelector('.nav-menu');
    const orderContainer = document.getElementById('orderContainer');
    const passwordContainer = document.getElementById('password-container');
    
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        if (orderContainer !== null) {
            orderContainer.classList.toggle('active');
        }

        if (passwordContainer !== null) {
            passwordContainer.classList.toggle('active');
        }
    });
});