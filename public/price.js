let price = 0;
let values = []
let lastsec = 0;
let maxItems = 30;

// crypto
let coin = "btc";
// coin pair
let pair = "busd";

function getPrice() {


    //websocket cucc
    let ws = new WebSocket('wss://stream.binance.com:9443/ws/' + coin + pair + '@trade');

    let pricetxt = document.getElementById("price");
    let coinpair = document.getElementById("coin-pair");
    let len = document.getElementById("len");

    coinpair.innerText = (coin + "-" + pair).toUpperCase();
    let before = 0;
    ws.onmessage = (event) => {

        let cryptodata = JSON.parse(event.data)
        price = parseFloat(cryptodata.p).toFixed(2);

        // html part
        pricetxt.innerText = price;
        // change color
        pricetxt.style.color = !before || before === price ? "black" : price > before ? "green" : "red";
        // price before for reference
        before = price;

        const d = new Date();
        let sec = d.getSeconds();

        if (sec !== lastsec) {
            values.push([(d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()).toString(), parseInt(price)]);
            chart();
            lastsec = sec;
            len.innerText = values.length;
        }
        if (values.length >= maxItems) {
            values.shift();
        }
    }
}

function chart() {
    google.charts.load('current', {packages: ['corechart', 'line']});
    google.charts.setOnLoadCallback(drawBasic);

    function drawBasic() {

        var data = new google.visualization.DataTable();
        getPrice(data);
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

getPrice();
chart();