//Csatlakozas letrehozasa
var socket = io.connect('http://localhost:4000');
let values = []
let coin = "";
// html elements
let pricetxt = document.getElementById("price");
let coinpair = document.getElementById("coin-pair");
// buy/sell buttons
let buyBtn = document.getElementById("buy");
let sellBtn = document.getElementById("sell");

let pricevalue = document.getElementById("price-value");

let optionCoin = document.getElementById("optionCoin");
let optionPair = document.getElementById("optionPair");

pricevalue.style.visibility = "hidden";

buyBtn.addEventListener("click", buy());
sellBtn.addEventListener("click", sell());


function buy() {
    pricevalue.style.visibility = "visible";
}

function sell() {
    pricevalue.style.visibility = "visible";
}

chart()
socket.on('data', function (data) {
    pricetxt.innerText = data.price + " $";
    values = data.values;
    coinpair.innerText = (data.coin + "-" + data.pair).toUpperCase();
    optionCoin.innerText = (data.coin).toUpperCase();
    optionPair.innerText = (data.pair).toUpperCase();
    coin = data.coin;
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