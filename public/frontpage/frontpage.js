let socket = io.connect('http://localhost:5000');

let divs = document.getElementsByClassName("coin");


for (let i = 0; i < divs.length; i++) {
    divs[i].addEventListener("click", function() {
        socket.emit("changeCoinPair", {
            coin: divs[i].id
        });
        window.location.replace("/main")
    });
}

let btcPrice = document.getElementById("btcPrice")
let btcChange = document.getElementById("btcChange")

socket.on("btcData", function (data) {
    btcPrice.innerText = "$ " + data.price;
    btcChange.innerText = data.change + "%";
    if(data.change < 0) {
        btcChange.style.color = "red";
    } else {
        btcChange.innerText = "+" + data.change + "%"
        btcChange.style.color = "green";
    }
});

let ethPrice = document.getElementById("ethPrice")
let ethChange = document.getElementById("ethChange")

socket.on("ethData", function (data) {
    ethPrice.innerText = "$ " + data.price;
    ethChange.innerText = data.change + "%";
    if(data.change < 0) {
        ethChange.style.color = "red";
    } else {
        ethChange.innerText = "+" + data.change + "%"
        ethChange.style.color = "green";
    }
});

let bnbPrice = document.getElementById("bnbPrice")
let bnbChange = document.getElementById("bnbChange")

socket.on("bnbData", function (data) {
    bnbPrice.innerText = "$ " + data.price;
    bnbChange.innerText = data.change + "%";
    if(data.change < 0) {
        bnbChange.style.color = "red";
    } else {
        bnbChange.innerText = "+" + data.change + "%"
        bnbChange.style.color = "green";
    }
});

let dogePrice = document.getElementById("dogePrice")
let dogeChange = document.getElementById("dogeChange")

socket.on("dogeData", function (data) {
    dogePrice.innerText = "$ " + data.price;
    dogeChange.innerText = data.change + "%";
    if(data.change < 0) {
        dogeChange.style.color = "red";
    } else {
        dogeChange.innerText = "+" + data.change + "%"
        dogeChange.style.color = "green";
    }
});

let shibPrice = document.getElementById("shibPrice")
let shibChange = document.getElementById("shibChange")

socket.on("shibData", function (data) {
    shibPrice.innerText = "$ " + data.price;
    shibChange.innerText = data.change + "%";
    if(data.change < 0) {
        shibChange.style.color = "red";
    } else {
        shibChange.innerText = "+" + data.change + "%"
        shibChange.style.color = "green";
    }
});

let tokens = document.getElementById("tokens");
let username = document.getElementById("name");

socket.on("userdata", function (data) {
    tokens.innerText = "$ " + data.tokens
    username.innerHTML = "<i class=\"fa fa-user\"></i> " + data.username + " <i class=\"fa fa-caret-down\"></i>";
})