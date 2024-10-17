function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    icon.classList.toggle('closed');
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}



const editButton = document.getElementById('editButton');
const editModal = document.getElementById('editModal');
const closeButton = document.querySelector('.close');
const editForm = document.getElementById('editForm');
const userLogin = document.getElementById('userLogin');
const userName = document.getElementById('userName');
const userPassword = document.getElementById('userPassword');
const profileImage = document.getElementById('profileImage');

function EditButton() {
    editModal.style.display = "flex";
    document.getElementById('editName').value = userName.textContent;
}


closeButton.onclick = function() {
    editModal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == editModal) {
        editModal.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.querySelector('#togglePassword');
    const passwordText = document.querySelector('#passwordText');
    const password = document.querySelector('#password');

    togglePassword.addEventListener('click', function() {
        if (password.style.display == 'block') {
            passwordText.style.display = 'block';
            password.style.display = 'none';
        }else{
            passwordText.style.display = 'none';
            password.style.display = 'block';
        }

        this.classList.toggle('fa-eye-slash');
        this.classList.toggle('fa-eye');
    });
});