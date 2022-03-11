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

app.use(require('cors')())
var server = app.listen(5000);
var io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:5000',
        optionsSuccessStatus: 200,
        methods: ["GET", "POST"]
    }
});
//app.use(express.static('public'));

let price = 0;
let values = [];
let lastsec = 0;
// ennyi adatot fog abrazolni a diagram
let maxItems = 100;
// tizedes jegyek az ar vegen
let digits = 2;
// crypto
let coin = "";
// coin pair
let pair = "busd";

// Price change percent
let pricechg = 0;

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

// ebbe a valtozoban van mentve a session
var session;

app.get('/', (req, res) => {
    session = req.session;
    res.sendFile('public/welcome/welcome.html', {root: __dirname})
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
    getInfo(req.body.username).then(function (result) {
        console.log(req.body.username)
        if (result.length > 0) {
            if (req.body.username === result[0].email || req.body.username === result[0].username
                && req.body.password === result[0].password
                && req.body.password.length > 7) {

                session = req.session;
                session.userid = result[0].username;
                session.usernameid = result[0].userID;

                console.log(">   [session] sikeres bejelentkezes", session.userid, "néven");
                //console.log(req.session)
                res.sendFile('/public/frontpage/frontpage.html', {root: __dirname});
            }
        } else {
            res.send('Invalid username or password');
        }
    }).catch(function () {
        console.log("problema van")
        res.sendFile('/public/error/error.html', {root: __dirname});
    });
});

// regisztralas funcio
app.post('/registeruser', function (req, res) {
    if (req.body.password === req.body.password2) {
        if (req.body.username.length > 3) {
            if (req.body.password.length > 7) {
                registerUser(req.body.username, req.body.password, req.body.email).then(function () {
                    res.sendFile(path.join(__dirname + '/public/login/login.html'));
                }).catch(function (error) {
                    res.send(error);
                    console.log("something went wrong", error);
                });
            } else {
                res.send("Password is not long enough! Min. 8 characters")
            }
        } else {
            res.send("Username is not long enough! Min. 3 characters")
        }
    } else {
        res.send("The 2 given passwords doesn't match!");
    }
});

// portfolio oldal
app.get('/user', function (req, res) {
    session = req.session;
    if (session.userid) {
        res.sendFile(path.join(__dirname + '/public/wallet/wallet.html'));
        getPortfolio(session.userid).then(function (result) {

        });
    } else {
        res.sendFile('public/login/login.html', {root: __dirname});
    }
});

app.get('/profile', function (req, res) {
    session = req.session;
    if (session.userid) {
        res.sendFile(path.join(__dirname + '/public/profile/profile.html'));
    } else {
        res.sendFile('public/login/login.html', {root: __dirname});
    }
});

app.get('/index', function (req, res) {
    session = req.session;
    if (session.userid) {
        res.sendFile(path.join(__dirname + '/public/frontpage/frontpage.html'));
    } else {
        res.sendFile('public/login/login.html', {root: __dirname});
    }
});

app.get('/error', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/error/error.html'));
});

// kijelentkezes
app.get('/logout', (req, res) => {
    req.session.destroy();
    console.log(">   [session]", session.userid, "kijelentkezett!")
    res.redirect('/');
});

//Ha uj kapcsolat jon letre
io.on('connection', (socket) => {
    let ws = new WebSocket('wss://stream.binance.com:9443/ws/' + coin + pair + '@ticker');
    let wsbtc = new WebSocket('wss://stream.binance.com:9443/ws/btcbusd@ticker');
    let wseth = new WebSocket('wss://stream.binance.com:9443/ws/ethbusd@ticker');
    let wsbnb = new WebSocket('wss://stream.binance.com:9443/ws/bnbbusd@ticker');
    let wsdoge = new WebSocket('wss://stream.binance.com:9443/ws/dogebusd@ticker');
    let wsshib = new WebSocket('wss://stream.binance.com:9443/ws/shibbusd@ticker');
    console.log(">   [Socket.io] sikeres csatlakozás")

    getInfo(session.userid).then(function (result) {
        socket.emit("userdata", {
            username: session.userid,
            tokens: result[0].token
        });
    }).catch(function (error) {
        console.log(error);
    });

    function getPrice() {
        //websocket cucc
        ws.onmessage = (event) => {
            // ha be van jelentkezve valaki es ha van megadva coin
            if (coin.length > 0) {

                let cryptodata = JSON.parse(event.data);
                if (coin === "shib") {
                    price = parseFloat(cryptodata.c).toFixed(8);
                } else if (coin === "doge") {
                    price = parseFloat(cryptodata.c).toFixed(4);
                } else {
                    price = parseFloat(cryptodata.c).toFixed(digits);
                }
                pricechg = cryptodata.P;

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
                        change: pricechg,
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

    wsbtc.onmessage = (event) => {
        let Thiscryptodata = JSON.parse(event.data);
        let Thisprice = parseFloat(Thiscryptodata.c).toFixed(digits);
        let Thispricechg = Thiscryptodata.P;

        socket.emit("btcData", {
            price: Thisprice,
            change: Thispricechg
        });
    }

    wseth.onmessage = (event) => {
        let Thiscryptodata = JSON.parse(event.data);
        let Thisprice = parseFloat(Thiscryptodata.c).toFixed(digits);
        let Thispricechg = Thiscryptodata.P;

        socket.emit("ethData", {
            price: Thisprice,
            change: Thispricechg
        });
    }

    wsbnb.onmessage = (event) => {
        let Thiscryptodata = JSON.parse(event.data);
        let Thisprice = parseFloat(Thiscryptodata.c).toFixed(digits);
        let Thispricechg = Thiscryptodata.P;

        socket.emit("bnbData", {
            price: Thisprice,
            change: Thispricechg
        });
    }

    wsdoge.onmessage = (event) => {
        let Thiscryptodata = JSON.parse(event.data);
        let Thisprice = parseFloat(Thiscryptodata.c).toFixed(4);
        let Thispricechg = Thiscryptodata.P;

        socket.emit("dogeData", {
            price: Thisprice,
            change: Thispricechg
        });
    }

    wsshib.onmessage = (event) => {
        let Thiscryptodata = JSON.parse(event.data);
        let Thisprice = parseFloat(Thiscryptodata.c).toFixed(8);
        let Thispricechg = Thiscryptodata.P;

        socket.emit("shibData", {
            price: Thisprice,
            change: Thispricechg
        });
    }

    socket.on("changeCoinPair", function (data) {
        values = []
        coin = data.coin;
    });

    // vasarlas funcio
    socket.on("buy", function (data) {
        buy(data);
    });
    // eladas funkcio
    socket.on("sell", function (data) {
        sell(data);
    });
    getPrice();
});

function buy(data) {
    // BELE KELL RAKNI HOGY AND CURRENCY = COIN
    let currentWealth = 0
    if (data.amount > 0) {

        getInfo(session.userid).then(function (userdata) {
            id = userdata[0].ID;
            let currentValue = data.amount * price;
            let userTokens = userdata[0].token - currentValue;

            // ha van ra eleg tokenje a felhasznalonak
            if (userdata[0].token >= currentValue) {
                getPortfolio(session.userid).then(function (result) {
                    if (result.length > 0) {

                        currentWealth = parseFloat(result[0].currencyValue.toFixed(10));
                        data.amount = parseFloat(data.amount)
                        let setto = data.amount + currentWealth;
                        let setpair = parseFloat(result[0].pairValue) + currentValue;
                        console.log("pair", setpair);
                        console.log("mar van");
                        let sql = "UPDATE coins SET currencyValue =" + setto + ", pairValue =" + setpair + " WHERE userID = " + id + " AND currency = " + "'" + coin + "'" + " AND pair = " + "'" + pair + "'";
                        console.log(sql);
                        database.query(sql, function (error) {
                            if (error) {
                                console.log(error);
                            } else {
                                sql = "UPDATE users SET token=" + userTokens + "WHERE ID = " + id;

                                database.query(sql, function (error) {
                                    if (error) {
                                        console.log(error);
                                        console.log(">   [MySQL] baj van a vasarlas funkcioval");
                                    }
                                });
                            }
                        });
                    } else {
                        // ha még nincs cryptod
                        console.log("még nincs cryptod")
                        let sql = "INSERT INTO coins(userID, currency, pair, currencyValue, pairValue) VALUES(" + id
                            + ",'" + coin + "','" + pair + "'," + data.amount + "," + currentValue + ")";
                        database.query(sql, function (error) {
                            if (error) {
                                console.log(error)
                            } else {
                                sql = "UPDATE users SET token=" + userTokens + "WHERE ID = " + id;

                                database.query(sql, function (error) {
                                    if (error) {
                                        console.log(error)
                                        console.log(">   [MySQL] baj van a vasarlas funkcioval")
                                    }
                                });
                            }
                        })
                    }
                }).catch(function () {
                    //ha hiba van a portfolio adatok lekeresevel
                });
                console.log("vettel", data.amount, "db", coin + "-t", currentValue, "értékben")
            } else {
                // ha a felhasznalonak nincsen eleg tokenje
                console.log("nincs ra eleg tokened!")
            }
        }).catch(function (error) {
            //ha hiba van a felhasznalo adatok lekeresevel
        });
    } else {
        // ha nulla van beirva osszegnek
        console.log("0 nál többet kell vegyél!")
    }
}

function sell(data) {
    // BELE KELL RAKNI HOGY AND CURRENCY = COIN
    if (data.amount > 0) {
        getInfo(session.userid).then(function (userdata) {
            id = userdata[0].ID;
            getPortfolio(session.userid).then(function (result) {
                if (result.length > 0) {
                    let currentWealth = parseFloat(result[0].currencyValue.toFixed(10));
                    if (data.amount <= currentWealth) {

                        data.amount = parseFloat(data.amount)
                        let currentValue = data.amount * price
                        let setto = currentWealth - data.amount
                        let setpair = parseFloat(result[0].pairValue) - currentValue

                        let sql = "UPDATE coins SET currencyValue =" + setto + ", pairValue =" + setpair + "WHERE userID = " + id + " AND currency = " + "'" + coin + "'" + " AND pair = " + "'" + pair + "'";

                        database.query(sql, function (error) {
                            if (error) {
                                console.log(error)
                            } else {
                                let userTokens = userdata[0].token + currentValue;
                                sql = "UPDATE users SET token=" + userTokens + "WHERE ID = " + id;

                                database.query(sql, function (error) {
                                    if (error) {
                                        console.log(error)
                                        console.log(">   [MySQL] baj van az eladas funkcioval")
                                    }
                                });
                            }
                        });
                    }
                } else {
                    // ha a felhasznalonak nincsen meg semmije
                }
            }).catch(function () {
                //ha hiba van a portfolio adatok lekeresevel
            });
        }).catch(function (error) {
            //ha hiba van a felhasznalo adatok lekeresevel
        })
    } else {
        console.log("0 nal tobbet kell eladnod!");
    }
}

// adatbazis lekerdezesek
function getInfo(user) {
    return new Promise((resolve, reject) => {

        var sql = "SELECT * FROM users WHERE username = " + "'" + user + "' OR email = " + "'" + user + "'";

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
function registerUser(username, password, email) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT username FROM users WHERE username =" + "'" + username + "'";

        database.query(sql, function (error, results) {
            if (error) {
                return reject(error);
            } else {
                // ha meg nem letezik ilyen felhasznalo es az adatok megfelelnel a kovetelmenyeknek
                if (results.length === 0 && username.length > 3 && password.length > 7) {
                    // felhasznalo letrehozasa a users tablaban 10 000 alap tokennel
                    var sql = "INSERT INTO users(username, email, password, token) VALUES (" + "'" + username + "'" + "," + "'" + email + "'" + ", '" + password + "'" + "," + "'" + 10000 + "'" + ")";

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

function getPortfolio(user) {
    return new Promise((resolve, reject) => {
        getInfo(user).then(function (result) {
            id = result[0].ID;
            var sql = "SELECT * FROM coins WHERE userID = " + id;
            database.query(sql, function (error, results) {
                if (error) {
                    console.log(">   [MySQL] valami baj van a portfolio lekeresevel a coins tablaban");
                } else {
                    return resolve(results);
                }
            });
        }).catch(function () {
            return reject();
            console.log("itt van a baj");
        });
    });
}
