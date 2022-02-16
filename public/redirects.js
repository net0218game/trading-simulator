const express = require('express');
const app = express();
const path = require('path');

const PORT = 4000;

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + 'index.html'));
    //__dirname : It will resolve to your project folder.
});

app.get('/user', function(req, res) {
    res.sendFile(path.join(__dirname + '/wallet/wallet.html'));
});

app.listen(PORT, () => console.log(`Server Running at port ${PORT}`));