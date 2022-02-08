// SOCKET.IO NAK AZ IMPORTALASA (sry caps)
var socket = require('socket.io');
const WebSocket = require('ws')

let databaseFile = require("./database.js");
let username = "david";


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
// ennyi adatot fog abrazolni a diagramm
let maxItems = 100;
// tizedes jegyek az ar vegen
let digits = 4;
let tokens = 0;
// crypto
let coin = "eth";
// coin pair
let pair = "busd"

//Ha uj kapcsolat jon letre
io.on('connection', (socket) => {
    console.log(">   [Socket.io] sikeres csatlakozás")
    function getPrice() {
        //websocket cucc
        let ws = new WebSocket('wss://stream.binance.com:9443/ws/' + coin + pair + '@trade');

        let before = 0;
        ws.onmessage = (event) => {
            let cryptodata = JSON.parse(event.data)
            price = parseFloat(cryptodata.p).toFixed(digits);
            before = price;
            tokens = database();
            console.log(tokens);
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
                pair: pair,
            });
        }
    }
    getPrice();
});

function database() {
    databaseFile.query("SELECT * FROM users WHERE username = " + "'" + username + "'", function (err, result) {
        for (var i = 0; i < result.length; i++) {
            var row = result[i];
            return row.tokenValue;
        }
    });

}
