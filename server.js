// SOCKET.IO NAK AZ IMPORTALASA (sry caps)
var socket = require('socket.io');
const WebSocket = require('ws')
const database = require("./database.js");

//szerver oldali alkalmazasok felallitasa / konfiguracioja
const express = require("express");
var app = express();
var server = app.listen(4000);
var io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});
app.use(express.static('public'));

let price = 0;
let values = [];
let lastsec = 0;
// ennyi adatot fog abrazolni a diagramm
let maxItems = 100;
// tizedes jegyek az ar vegen
let digits = 4;
// crypto
let coin = "btc";
// coin pair
let pair = "busd";

//Ha uj kapcsolat jon letre
io.on('connection', (socket) => {
    console.log(">   [Socket.io] sikeres csatlakozás")

    function getPrice() {
        //websocket cucc
        let ws = new WebSocket('wss://stream.binance.com:9443/ws/' + coin + pair + '@trade');

        let before = 0;
        ws.onmessage = (event) => {
            let cryptodata = JSON.parse(event.data);
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
            // lekerdezes az adatbazisbol
            getInfo("david").then(function (result) {
                // adat kuldese socket.io val
                socket.emit("data", {
                    price: price,
                    values: values,
                    coin: coin,
                    pair: pair,
                    tokens: result[0].tokenValue
                });
            }).catch(function (error) {
                console.log(error);
            });
        }
    }

    socket.on("buy", function (data) {
        buy(data);
    });

    socket.on("sell", function (data) {
        sell(data);
    });

    socket.on("register", function (data) {
        registerUser(data.username, data.password);
    });

    /*
    socket.on("convert", function (data) {

        socket.emit("convert", {
            value: convert(data)
        });
    });
     */

    getPrice();
});

function buy(data) {
    console.log("buying process", data.amount, data.type, "\n",
        price, coin, pair);
}

function sell(data) {
    console.log("selling process", data.amount, data.type, "\n",
        price, coin, pair);
}


/*
function convert(data) {
    let value;
    if (data.type === coin) {
        value = price * data.amount;
        console.log(value);
        //return value;
    } else {
        let ws = new WebSocket('wss://stream.binance.com:9443/ws/' + pair + coin + '@trade');
        ws.onmessage = (event) => {
            let cryptodata = JSON.parse(event.data);
            let exchangePrice = parseFloat(cryptodata.p).toFixed(digits);
            //value = exchangePrice * data.amount

        }
    }
    return value;
}
 */

// adatbazis lekerdezesek
function getInfo(user) {
    return new Promise((resolve, reject) => {

        //var sql = "SELECT * FROM users WHERE username = " + "'" + user + "'";
        var sql = "SELECT * FROM coins WHERE userID = 0";

        database.query(sql, function (error, results) {
            if (error) {
                return reject("nem inditottad el az xamppot!");
            } else {
                return resolve(results);
            }
        });
        /*
        database.end(function (err) {
            if (err) {
                console.error('Error connecting: ' + err);
            }
            console.log('Connection closed!');
        });

         */
    });
}

function registerUser(username, password) {

    return new Promise((resolve, reject) => {
        var sql = "SELECT username FROM users WHERE username = " + "'" + username + "'";

        database.query(sql, function (error, results) {
            if (error) {
                return reject(error);
            } else {
                if (results.length === 0) {
                    var sql = "INSERT INTO users(username, password) VALUES (" + "'" + username + "'" + "," + "'" + password + "'" + ")";

                    database.query(sql, function (error, results) {
                        if (error) {
                            return reject(error);
                        } else {
                            return resolve(results);
                        }
                    });
                } else {
                    console.log("user", username, "already exists!")
                }
            }
        });
    });
}