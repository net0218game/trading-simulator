let socket = io.connect();

let divs = document.getElementsByClassName("pfpImage");


for (let i = 0; i < divs.length; i++) {
    divs[i].addEventListener("click", function () {
        socket.emit("changePfp", {
            pfp: divs[i].id
        });
        window.location.replace("/profile")
    });

}

// Get the modal
let modal = document.getElementById("myModal");

// Get the button that opens the modal
let btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
btn.onclick = function () {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

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
        '                    <a href="/chng"><i class="fa fa-edit fa-fw w3-margin-right w3-xlarge w3-text-grey"\n' +
        '                                             style="float: right"></i></a></p>'
    email2.innerHTML = '<p id="email2" class="w3-text-grey w3-padding-1 w3-large"><i\n' +
        '                        class="fa fa-envelope fa-fw w3-margin-right w3-xlarge w3-text-cyan"></i>' + data.email +
        '                    <a href="/chng"><i class="fa fa-edit fa-fw w3-margin-right w3-xlarge w3-text-grey"\n' +
        '                                             style="float: right"></i></a></p>'
    email.innerHTML = "<i class=\"fa fa-envelope fa-fw w3-margin-right w3-large w3-text-cyan\"></i>" + data.email;
    passw.innerHTML = '<p id="password" class="w3-text-grey w3-padding-1 w3-large"><i\n' +
        '                        class="fa fa-lock fa-fw w3-margin-right w3-xlarge w3-text-cyan"></i>' + data.password +
        '                    <a href="/chng"><i class="fa fa-edit fa-fw w3-margin-right w3-xlarge w3-text-grey"\n' +
        '                                       style="float: right"></i></a></p>'

});

let leaderboardTable = document.getElementById("leaderboard")
let userPlace = document.getElementById("userPlace")

socket.on("leaderboard", function (data) {

    leaderboardTable.innerHTML = '<tr>\n' +
        '                            <th>Place</th>\n' +
        '                            <th>Username</th>\n' +
        '                            <th>Account Balance</th>\n' +
        '                            <th>Profit</th>\n' +
        '                        </tr>';
    for (let i = 0; i < data.leaderboard.length; i++) {
        leaderboardTable.innerHTML += '<tr>\n' +
            '                            <td>#' + data.leaderboard[i][0] + '</td>\n' +
            '                            <td>' + data.leaderboard[i][1] + '</td>\n' +
            '                            <td>$ ' + parseFloat(data.leaderboard[i][2]).toLocaleString('en-US') + '</td>\n' +
            '                            <td>$ ' + parseFloat(data.leaderboard[i][3]).toLocaleString('en-US') + '</td>\n' +
            '                        </tr>'
    }

    userPlace.innerHTML = '<tr>\n' +
        '                            <td>#' + data.userPlace[0][0] + '</td>\n' +
        '                            <td>' + data.userPlace[0][1] + '</td>\n' +
        '                            <td>$ ' + parseFloat(data.userPlace[0][2]).toLocaleString('en-US') + '</td>\n' +
        '                            <td>$ ' + parseFloat(data.userPlace[0][3]).toLocaleString('en-US') + '</td>\n' +
        '                        </tr>';

});