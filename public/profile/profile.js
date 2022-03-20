let socket = io.connect('http://localhost:5000');

let tokens = document.getElementById("tokens");
let username = document.getElementById("name");
let username2 = document.getElementById("name2");
let email = document.getElementById("email");
let pfp = document.getElementById("pfp");

socket.on("userdata", function (data) {
    pfp.src = "/profilePictures/" + data.pfp + ".png"
    tokens.innerHTML = "<i class=\"fa fa-money fa-fw w3-margin-right w3-large w3-text-cyan\"></i>" + data.tokens;
    username.innerHTML = "<i class=\"fa fa-user\"></i> " + data.username + " <i class=\"fa fa-caret-down\"></i>";
    username2.innerHTML = "<i class=\"fa fa-user fa-fw w3-margin-right w3-large w3-text-cyan\"></i>" + data.username;
    email.innerHTML = "<i class=\"fa fa-envelope fa-fw w3-margin-right w3-large w3-text-cyan\"></i>" + data.email;
});