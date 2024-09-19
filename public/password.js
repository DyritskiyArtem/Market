function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    icon.classList.toggle('closed');
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}