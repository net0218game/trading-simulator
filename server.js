// SOCKET.IO NAK AZ IMPORTALASA (sry caps)
var socket = require('socket.io');
const WebSocket = require('ws')
const database = require("./database.js");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
//szerver oldali alkalmazasok felallitasa / konfiguracioja
const express = require("express");
const path = require("path");
var app = express();
var server = app.listen(4000);
var io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});
//app.use(express.static('public'));

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

// session generalasa
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: {maxAge: oneDay},
    resave: false
}));

// bejovo adat feldolgozasa
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// root directory path-je
app.use(express.static(path.join(__dirname, '/public')));

// cookie parser nemtom mi
app.use(cookieParser());

// ebbe a valtozoba van mentve a session
var session;

app.get('/', (req, res) => {
    session = req.session;
    if (session.userid) {
        console.log(">   [session] be vagy jelentkezve")
    } else {
        console.log(">   [session] nem vagy bejelentkezve")
        res.sendFile('public/login/login.html', {root: __dirname})
    }
});

app.get('/register', (req, res) => {
    res.sendFile('public/register/register.html', {root: __dirname})
});

app.post('/main', (req, res) => {
    getLoginInfo(req.body.username).then(function (result) {
        if (req.body.username == result[0].username && req.body.password == result[0].password) {
            session = req.session;
            session.userid = req.body.username;
            console.log(">   [session] sikeres bejelentkezes", session.userid, "néven");
            //console.log(req.session)
            res.sendFile('/public/main/main.html', {root: __dirname})
        } else {
            console.log(">   [server] sikertelen bejelentkezes");
            res.send('Invalid username or password');
        }
    });
});

app.post('/registeruser', function (req, res) {
    if (req.body.password === req.body.password2 && req.body.username.length !== 0 && req.body.password.length > 7) {
        registerUser(req.body.username, req.body.password).then(function () {
            res.sendFile(path.join(__dirname + '/public/login/login.html'));
        }).catch(function (error) {
            console.log("something went wrong", error)
        });

    } else {
        res.send("nem egyezik a 2 jelszo");
        console.log("nem egyezik a 2 jelszo");
    }
});

app.get('/user', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/wallet/wallet.html'));
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    console.log(">   [session]", session.userid, "kijelentkezett!")
    res.redirect('/');
});

//Ha uj kapcsolat jon letre
io.on('connection', (socket) => {
    let ws = new WebSocket('wss://stream.binance.com:9443/ws/' + coin + pair + '@trade');
    console.log(">   [Socket.io] sikeres csatlakozás")

    function getPrice() {
        //websocket cucc

        let before = 0;
        ws.onmessage = (event) => {
            if (session.userid) {
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
                getInfo(session.userid).then(function (result) {
                    // adat kuldese socket.io val
                    socket.emit("data", {
                        price: price,
                        values: values,
                        coin: coin,
                        pair: pair,
                        tokens: result[0].token,
                        username: session.userid
                    });
                }).catch(function (error) {
                    console.log(error);
                });
            }

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

        var sql = "SELECT * FROM users WHERE username = " + "'" + user + "'";

        database.query(sql, function (error, results) {
            if (error) {
                return reject(">   [MySQL] nem inditottad el az xamppot!");
            } else {
                return resolve(results);
            }
        });
    });
}

// uj felhasznalo regisztralasa
function registerUser(username, password) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT username FROM users WHERE username =" + "'" + username + "'";

        database.query(sql, function (error, results) {
            if (error) {
                return reject(error);
            } else {
                if (results.length === 0 && username.length > 2 && password.length > 7) {
                    var sql = "INSERT INTO users(username, password, token) VALUES (" + "'" + username + "'"
                        + "," + "'" + password + "'" + "," + "'" + 10000 + "'" + ")";

                    database.query(sql, function (error, results) {
                        if (error) {
                            return reject(error);
                        } else {
                            console.log(">   [MySQL] user", username, "has been registered!");
                            return resolve(results);
                        }
                    });

                    sql = "SELECT userID FROM users WHERE username =" + "'" + username + "'";
                    database.query(sql, function (error, results) {
                        if (error) {
                            console.log(">   [MySQL] userID nem talalhato")
                        } else {
                            sql = "INSERT INTO coins(ID) VALUES (" + "'" + results[0].userID + "'" + ")";
                            database.query(sql, function (error) {
                                if (error) {
                                    console.log(">   [MySQL] hiba tortent a coins tablaba letrehozasnal")
                                }
                            });
                        }
                    });

                    /*
                    var sql = "INSERT INTO coins (userID, tokenValue) VALUES (" + userdata[0].ID + "," + 10000 + ")";

                    database.query(sql, function (error) {
                        if (error) {
                            console.log(">   [MySQL] hiba történt az új felhasználó regisztrációja során a COINS " +
                                "táblába.")
                        }
                    });
                     */

                } else {
                    console.log(">   [MySQL] user", username, "already exists!");
                }
            }
        });
    });
}

function getLoginInfo(user) {
    return new Promise((resolve, reject) => {

        var sql = "SELECT * FROM users WHERE username = " + "'" + user + "'";

        database.query(sql, function (error, results) {
            if (error) {
                console.log(">   [MySQL] valami baj van az id keresesevel a felhasznalok tablaban");
            } else {
                console.log(results[0].username);
                return resolve(results);
            }
        });
    });
}