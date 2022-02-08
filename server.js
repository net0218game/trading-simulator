// SOCKET.IO NAK AZ IMPORTALASA (sry caps)
var socket = require('socket.io');
const WebSocket = require('ws')

//szerver oldali alkalmazasok felallitasa / konfiguracioja
const express = require("express")
var app = express();
var server = app.listen(4000);
var io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});

app.use(express.static('public'));

let price = 0;
let values = []
let lastsec = 0;
let maxItems = 100;
let digits = 4;

// crypto
let coin = "eth";
// coin pair
let pair = "busd"

//Ha uj kapcsolat jon letre
io.on('connection', (socket) => {
    function getPrice() {
        //websocket cucc
        let ws = new WebSocket('wss://stream.binance.com:9443/ws/' + coin + pair + '@trade');

        //coinpair.innerText = (coin + "-" + pair).toUpperCase();
        let before = 0;
        ws.onmessage = (event) => {

            let cryptodata = JSON.parse(event.data)
            price = parseFloat(cryptodata.p).toFixed(digits);

            // html part
            //pricetxt.innerText = price;
            // change color
            //pricetxt.style.color = !before || before === price ? "black" : price > before ? "green" : "red";
            // price before for reference
            before = price;

            const d = new Date();
            let sec = d.getSeconds();

            if (sec !== lastsec) {
                values.push([(d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()).toString(), parseInt(price)]);
                //chart();
                lastsec = sec;
                //len.innerText = values.length;
            }
            if (values.length >= maxItems) {
                values.shift();
            }
            socket.emit("data", {
                price: price,
                values: values,
                coin: coin,
                pair: pair

            });
        }
    }

    getPrice();
});