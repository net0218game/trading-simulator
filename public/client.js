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
// buy/sell buttons
let buyBtn = document.getElementById("buy");
let sellBtn = document.getElementById("sell");

let pricevalue = document.getElementById("price-value");

let optionCoin = document.getElementById("optionCoin");
let optionPair = document.getElementById("optionPair");
// ==================================================

pricevalue.style.visibility = "hidden";

buyBtn.addEventListener("click", buy);
sellBtn.addEventListener("click", sell);


function buy() {
    pricevalue.style.visibility = "visible";
    console.log("xdddd");
}

function sell() {
    pricevalue.style.visibility = "visible";
}

// Grafikon rajzolása
chart()

// Adat beérkezése esetén
socket.on('data', function (data) {
    price = data.price;
    coin = data.coin;
    pair = data.pair;
    if(pair == "busd") {
        pair = "usd";
    }
    pricetxt.innerText = price + " $";
    values = data.values;
    coinpair.innerText = (coin + "-" + pair).toUpperCase();
    title.innerText = price + " | " + (coin + "-" + pair).toUpperCase();
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