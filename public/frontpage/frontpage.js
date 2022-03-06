var socket = io.connect('http://localhost:4000');

function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

let divs = document.getElementsByClassName("coin");


for (let i = 0; i < divs.length; i++) {
    divs[i].addEventListener("click", function() {
        socket.emit("changeCoinPair", {
            coin: divs[i].id
        });
        window.location.replace("/main")
    });
}