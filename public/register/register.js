var socket = io.connect('http://localhost:4000');

let username = document.getElementById("username");
let password = document.getElementById("password");
let password2 = document.getElementById("password2");
let submit = document.getElementById("register");

submit.addEventListener("click", function () {
    if(password.value === password2.value) {
        socket.emit("register", {
            username: username.value,
            password: password.value
        })
    }
    else {
        alert("elirtad te idiota")
    }
});