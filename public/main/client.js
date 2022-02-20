//Csatlakozas letrehozasa
var socket = io.connect('http://localhost:4000');

let values = []
let coin = "";
let pair = "";

// ==================================================
// html elements
let title = document.getElementById("pageTitle");
let pricetxt = document.getElementById("price");
let coinpair = document.getElementById("coin-pair");
let tokens = document.getElementById("tokens");
// buy/sell buttons
let buyBtn = document.getElementById("buy");
let sellBtn = document.getElementById("sell");

let pricevalue = document.getElementById("price-value");

let options = document.getElementById("currency");
let optionCoin = document.getElementById("optionCoin");
let optionPair = document.getElementById("optionPair");

let converted = document.getElementById("converted");
let name = document.getElementById("name");
// ==================================================

pricevalue.style.visibility = "hidden";

buyBtn.addEventListener("click", buy);
sellBtn.addEventListener("click", sell);

function buy() {
    if (pricevalue.style.visibility === "visible") {
        socket.emit("buy", {
            amount: pricevalue.value,
            type: options.value
        });
    } else {
        pricevalue.style.visibility = "visible";
    }
}

function sell() {
    if (pricevalue.style.visibility === "visible") {
        socket.emit("sell", {
            amount: pricevalue.value,
            type: options.value
        });
    } else {
        pricevalue.style.visibility = "visible";
    }
}

/*
function convert() {
    socket.emit("convert", {
        amount: pricevalue.value,
        type: options.value
    })
    socket.on("convert", function (data) {
        converted.innerText = data.value + " " + data.pair;
    });
}
 */

// Grafikon rajzolása
chart()

// Adat beérkezése esetén
socket.on('data', function (data) {
    price = data.price;
    coin = data.coin;
    pair = data.pair;
    if (pair == "busd") {
        pair = "usd";
    }
    pricetxt.innerText = price + " $";
    values = data.values;
    coinpair.innerText = (coin + "-" + pair).toUpperCase();
    title.innerText = price + " | " + (coin + "-" + pair).toUpperCase();
    optionCoin.innerText = (coin).toUpperCase();
    optionPair.innerText = (pair).toUpperCase();
    tokens.innerHTML = '<i class="fa fa-money" aria-hidden="true"></i>:' + " " + data.tokens;
    name.innerText = "Username:" + " " + data.username;

    // Grafikon rajzolasa a frissitett adatok alapjan
    chart();
    //convert();
});


function chart() {
    google.charts.load('current', {packages: ['corechart', 'line']});
    google.charts.setOnLoadCallback(drawBasic);

    function drawBasic() {

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Time');
        data.addColumn('number', coin.toUpperCase());

        data.addRows(values);

        var options = {
            hAxis: {
                title: 'Time\nDate, H:M:S'
            }, vAxis: {
                title: 'Price'
            },
            //'backgroundColor': 'transparent'
        };

        var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

        chart.draw(data, options);
    }
}