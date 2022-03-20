let socket = io.connect('http://localhost:5000');

let tokens = document.getElementById("tokens");
let username = document.getElementById("name");
let username2 = document.getElementById("name2");
let username3 = document.getElementById("name3");
let email = document.getElementById("email");
let email2 = document.getElementById("email2");
let passw = document.getElementById("password");
let pfp = document.getElementById("pfp");

socket.on("userdata", function (data) {
    pfp.src = "/profilePictures/" + data.pfp + ".png"
    tokens.innerHTML = "<i class=\"fa fa-money fa-fw w3-margin-right w3-large w3-text-cyan\"></i>" + data.tokens;
    username.innerHTML = "<i class=\"fa fa-user\"></i> " + data.username + " <i class=\"fa fa-caret-down\"></i>";
    username2.innerHTML = "<i class=\"fa fa-user fa-fw w3-margin-right w3-large w3-text-cyan\"></i>" + data.username;
    username3.innerHTML = '<p id="name3" class="w3-text-grey w3-padding-1 w3-large"><i\n' +
        '                        class="fa fa-user fa-fw w3-margin-right w3-xlarge w3-text-cyan"></i>' + data.username +
        '                    <a href="/changepswd"><i class="fa fa-edit fa-fw w3-margin-right w3-xlarge w3-text-grey"\n' +
        '                                             style="float: right"></i></a></p>'
    email2.innerHTML = '<p id="email2" class="w3-text-grey w3-padding-1 w3-large"><i\n' +
        '                        class="fa fa-envelope fa-fw w3-margin-right w3-xlarge w3-text-cyan"></i>' + data.email +
        '                    <a href="/changepswd"><i class="fa fa-edit fa-fw w3-margin-right w3-xlarge w3-text-grey"\n' +
        '                                             style="float: right"></i></a></p>'
    email.innerHTML = "<i class=\"fa fa-envelope fa-fw w3-margin-right w3-large w3-text-cyan\"></i>" + data.email;
    passw.innerHTML = '<p id="password" class="w3-text-grey w3-padding-1 w3-large"><i\n' +
        '                        class="fa fa-lock fa-fw w3-margin-right w3-xlarge w3-text-cyan"></i>' + data.password +
        '                    <a href="/chng"><i class="fa fa-edit fa-fw w3-margin-right w3-xlarge w3-text-grey"\n' +
        '                                       style="float: right"></i></a></p>'

});