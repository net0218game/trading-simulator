// SOCKET.IO NAK AZ IMPORTALASA (sry caps)
var socket = require('socket.io');
const WebSocket = require('ws')
var mysql = require('mysql');

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

var database = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "trading-simulator"
});

database.connect(function (err) {
    if (err) throw err;
    console.log("sikeres csatlakozás");
});

let price = 0;
let values = []
let lastsec = 0;
// ennyi adatot fog abrazolni a diagramm
let maxItems = 100;
// tizedes jegyek az ar vegen
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

        let before = 0;
        ws.onmessage = (event) => {
            let cryptodata = JSON.parse(event.data)
            price = parseFloat(cryptodata.p).toFixed(digits);

            before = price;

            const d = new Date();
            let sec = d.getSeconds();

            // belerakja egy listaba a datumot (elso hely), es az arat (masodik hely)
            if (sec !== lastsec) {
                values.push([(d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()).toString(), parseInt(price)]);
                lastsec = sec;
            }
            // diagramm max adatok ellenorzese
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