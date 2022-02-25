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
        res.sendFile('public/main/main.html', {root: __dirname})
    } else {
        console.log(">   [session] nem vagy bejelentkezve")
        res.sendFile('public/login/login.html', {root: __dirname})
    }
});

app.get('/main', (req, res) => {
    session = req.session;
    if (session.userid) {
        console.log(">   [session] be vagy jelentkezve")
        res.sendFile('public/main/main.html', {root: __dirname})
    } else {
        console.log(">   [session] nem vagy bejelentkezve")
        res.sendFile('public/login/login.html', {root: __dirname})
    }
});

app.get('/register', (req, res) => {
    res.sendFile('public/register/register.html', {root: __dirname})
});

// fo oldal
app.post('/main', (req, res) => {
    getLoginInfo(req.body.username).then(function (result) {
        if (req.body.username == result[0].username && req.body.password == result[0].password) {
            session = req.session;
            session.userid = req.body.username;
            getInfo(req.body.username).then(function (data) {
                session.usernameid = data[0].userID
            });
            console.log(">   [session] sikeres bejelentkezes", session.userid, "néven");
            //console.log(req.session)
            res.sendFile('/public/main/main.html', {root: __dirname})
        } else {
            console.log(">   [server] sikertelen bejelentkezes");
            res.send('Invalid username or password');
        }
    });
});

// regisztralas funcio
app.post('/registeruser', function (req, res) {
    if (req.body.password === req.body.password2 && req.body.username.length > 3 && req.body.password.length > 7) {
        registerUser(req.body.username, req.body.password).then(function () {
            res.sendFile(path.join(__dirname + '/public/login/login.html'));
        }).catch(function (error) {
            res.send(error);
            console.log("something went wrong", error)
        });

    } else {
        res.send("nem egyezik a 2 jelszo, vagy nem felel meg a kovetelmenyeknek");
        console.log("nem egyezik a 2 jelszo, vagy nem felel meg a kovetelmenyeknek");
    }
});

// portfolio oldal
app.get('/user', function (req, res) {
    session = req.session;
    if (session.userid) {
        res.sendFile(path.join(__dirname + '/public/wallet/wallet.html'));
    } else {
        res.sendFile('public/login/login.html', {root: __dirname})
    }
});

// kijelentkezes
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
            // ha be van jelentkezve valaki
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

    // vasarlas funcio
    socket.on("buy", function (data) {
        buy(data);
    });
    // eladas funkcio
    socket.on("sell", function (data) {
        sell(data);
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
    if (data.amount > 0) {
        getInfo(session.userid).then(function (userdata) {
            let currentValue = data.amount * price;
            if (userdata[0].token >= currentValue) {
                // ide jon a vasarlas funkcio
                /*
                var sql = "UPDATE coins SET currency =" + "'" + coin + "', pair =" + "'" + pair + "', currencyValue =" +
                    data.amount + ", pairValue =" + currentValue + " WHERE ID =" + session.usernameid;
                console.log(sql);
                 */

                let sql = "INSERT INTO coins(currency, pair, currencyValue, pairValue) VALUES(" + "'" + coin + "','" + pair +
                    "'," + data.amount + "," + currentValue + ")";
                database.query(sql, function (error) {
                    if (error) {
                        return reject(">   [MySQL] nem inditottad el az xamppot!");
                    } else {
                        getInfo(session.userid).then(function (result) {
                            id = result[0].ID;
                            userTokens = result[0].token - currentValue;
                            sql = "UPDATE users SET token=" + userTokens + "WHERE ID =" + id;
                            database.query(sql, function (error) {
                                if (error) {
                                    console.log(">   [MySQL] baj van a vasarlas funkcioval")
                                }
                            });
                        });
                    }
                });
                console.log("vettel", data.amount, "db", coin + "-t", currentValue, "értékben")
            } else {
                // ha a felhasznalonak nincsen eleg tokenje
                app.post("/main", function (req, res) {
                    res.send('<script>alert("your alert message"); window.location.href = "/main"; </script>');
                });
                console.log("nincs ra eleg tokened!")
            }
        });
    } else {
        // ha nulla van beirva osszegnek
        console.log("0 nál többet kell vegyél!")
    }
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
                // ha meg nem letezik ilyen felhasznalo es az adatok megfelelnel a kovetelmenyeknek
                if (results.length === 0 && username.length > 3 && password.length > 7) {
                    // felhasznalo letrehozasa a users tablaban 10 000 alap tokennel
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
                } else {
                    console.log(">   [MySQL] user", username, "already exists!");
                    return reject("user '" + username + "' already exists!");
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
                return resolve(results);
            }
        });
    });
}