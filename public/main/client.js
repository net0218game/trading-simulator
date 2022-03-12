fetch('http://localhost:5000')
    .then(response => response.json())
    .then(data => console.log(data));

function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}

//Csatlakozas letrehozasa
var socket = io.connect('http://localhost:5000');

let values = []
let coin = "";
let pair = "";

// ==================================================
// html elements
let title = document.getElementById("pageTitle");
let pricetxt = document.getElementById("price");
let changetxt = document.getElementById("change");
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
let logout = document.getElementById("logout");
let portfolio = document.getElementById("portfolio");
// ==================================================


buyBtn.addEventListener("click", buy);
sellBtn.addEventListener("click", sell);

function buy() {
    socket.emit("buy", {
        amount: pricevalue.value,
        type: options.value
    });
}

function sell() {
    socket.emit("sell", {
        amount: pricevalue.value,
        type: options.value
    });
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
    let price = data.price;
    let change = data.change;
    let coin = data.coin;
    let pair = data.pair;
    if (pair === "busd") {
        pair = "usd";
    }
    pricetxt.innerText = price + " $";
    changetxt.innerText = "24h Change: " + change + "%";
    values = data.values;
    coinpair.innerText = (coin + "-" + pair).toUpperCase();
    title.innerText = price + " | " + (coin + "-" + pair).toUpperCase();
    tokens.innerHTML = data.tokens + " <i class=\"fa fa-money\" aria-hidden=\"true\"></i>";
    name.innerHTML = "<i class=\"fa fa-user\"></i> " + data.username + " <i class=\"fa fa-caret-down\"></i>";

    optionCoin.innerText = (coin).toUpperCase();
    optionPair.innerText = (pair).toUpperCase();
    // Grafikon rajzolasa a frissitett adatok alapjan
    chart();
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
            curveType: 'function',
            legend: {position: 'top'},
            'backgroundColor': 'transparent',
            colors: ['lightblue'],
            'chartArea': {'width': '87%', 'height': '87%'}
        };

        var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

        chart.draw(data, options);
    }
}
