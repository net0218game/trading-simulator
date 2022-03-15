let socket = io.connect('http://localhost:5000');

let divs = document.getElementsByClassName("coin");


for (let i = 0; i < divs.length; i++) {
    divs[i].addEventListener("click", function () {
        socket.emit("changeCoinPair", {
            coin: divs[i].id
        });
        window.location.replace("/main")
    });
}

let btcPrice = document.getElementById("btcPrice");
let btcChange = document.getElementById("btcChange");
let btcBefore = 0;

socket.on("btcData", function (data) {

    btcPrice.innerText = "$ " + parseFloat(data.price).toLocaleString('en-US');
    btcChange.innerText = data.change + "%";
    if (data.change < 0) {
        btcChange.style.color = "red";
    } else if (data.change > 0) {
        btcChange.innerText = "+" + data.change + "%"
        btcChange.style.color = "green";
    } else if (data.change === 0) {
        btcChange.innerText = data.change + "%"
        btcChange.style.color = "grey";
    }

    if(btcBefore > data.price) {
        btcPrice.style.color = "red";
    } else if(btcBefore < data.price) {
        btcPrice.style.color = "green";
    } else if(btcBefore === data.price) {
        btcPrice.style.color = "grey";
    }
    btcBefore = data.price;
});

let ethPrice = document.getElementById("ethPrice");
let ethChange = document.getElementById("ethChange");
let ethBefore = 0;

socket.on("ethData", function (data) {
    ethPrice.style.color = "black";
    ethPrice.innerText = "$ " + parseFloat(data.price).toLocaleString('en-US');
    ethChange.innerText = data.change + "%";
    if (data.change < 0) {
        ethChange.style.color = "red";
    } else if (data.change > 0) {
        ethChange.innerText = "+" + data.change + "%"
        ethChange.style.color = "green";
    } else if (data.change === 0) {
        ethChange.innerText = data.change + "%"
        ethChange.style.color = "grey";
    }

    if(ethBefore > data.price) {
        ethPrice.style.color = "red";
    } else if(ethBefore < data.price) {
        ethPrice.style.color = "green";
    } else if(ethBefore === data.price) {
        ethPrice.style.color = "grey";
    }
    ethBefore = data.price;
});

let bnbPrice = document.getElementById("bnbPrice");
let bnbChange = document.getElementById("bnbChange");
let bnbBefore = 0;

socket.on("bnbData", function (data) {
    bnbPrice.style.color = "black";
    bnbPrice.innerText = "$ " + parseFloat(data.price).toLocaleString('en-US');
    bnbChange.innerText = data.change + "%";
    if (data.change < 0) {
        bnbChange.style.color = "red";
    } else if (data.change > 0) {
        bnbChange.innerText = "+" + data.change + "%"
        bnbChange.style.color = "green";
    } else if (data.change === 0) {
        bnbChange.innerText = data.change + "%"
        bnbChange.style.color = "grey";
    }

    if(bnbBefore > data.price) {
        bnbPrice.style.color = "red";
    } else if(bnbBefore < data.price) {
        bnbPrice.style.color = "green";
    } else if(bnbBefore === data.price) {
        bnbPrice.style.color = "grey";
    }
    bnbBefore = data.price
});

let dogePrice = document.getElementById("dogePrice");
let dogeChange = document.getElementById("dogeChange");
let dogeBefore = 0;

socket.on("dogeData", function (data) {
    dogePrice.style.color = "black";
    dogePrice.innerText = "$ " + data.price.toLocaleString('en-US');
    dogeChange.innerText = data.change + "%";
    if (data.change < 0) {
        dogeChange.style.color = "red";
    } else if (data.change > 0) {
        dogeChange.innerText = "+" + data.change + "%"
        dogeChange.style.color = "green";
    } else if (data.change === 0) {
        dogeChange.innerText = data.change + "%"
        dogeChange.style.color = "grey";
    }

    if(dogeBefore > data.price) {
        dogePrice.style.color = "red";
    } else if(dogeBefore < data.price) {
        dogePrice.style.color = "green";
    } else if(dogeBefore === data.price) {
        dogePrice.style.color = "grey";
    }
    dogeBefore = data.price;
});

let shibPrice = document.getElementById("shibPrice");
let shibChange = document.getElementById("shibChange");
let shibBefore = 0;

socket.on("shibData", function (data) {
    shibPrice.style.color = "black";
    shibPrice.innerText = "$ " + data.price.toLocaleString('en-US');
    shibChange.innerText = data.change + "%";
    if (data.change < 0) {
        shibChange.style.color = "red";
    } else if (data.change > 0) {
        shibChange.innerText = "+" + data.change + "%"
        shibChange.style.color = "green";
    } else if (data.change === 0) {
        shibChange.innerText = data.change + "%"
        shibChange.style.color = "grey";
    }

    if(shibBefore > data.price) {
        shibPrice.style.color = "red";
    } else if(shibBefore < data.price) {
        shibPrice.style.color = "green";
    } else if(shibBefore === data.price) {
        shibPrice.style.color = "grey";
    }
    shibBefore = data.price;
});

let tokens = document.getElementById("tokens");
let username = document.getElementById("name");

socket.on("userdata", function (data) {
    tokens.innerText = "$ " + data.tokens
    username.innerHTML = "<i class=\"fa fa-user\"></i> " + data.username + " <i class=\"fa fa-caret-down\"></i>";
})
