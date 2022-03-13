let socket = io.connect('http://localhost:5000');

let back = document.getElementById("back");

back.addEventListener("click", function () {
    window.location.replace("/main");
});

google.charts.load('current', {'packages': ['corechart']});
google.charts.setOnLoadCallback(drawChart);

var intervalId = window.setInterval(function () {
    drawChart()
}, 1000);


let tokens = document.getElementById("tokens");
let tokens2 = document.getElementById("tokens2");
let username = document.getElementById("name");
let username2 = document.getElementById("name2");
let email = document.getElementById("email");

socket.on("userdata", function (data) {
    tokens.innerHTML = data.tokens + "<i class=\"fa fa-money fa-fw w3-margin-right w3-large w3-text\"></i>";
    tokens2.innerHTML = "<i class=\"fa fa-money fa-fw w3-margin-right w3-large w3-text-cyan\"></i>" + data.tokens;
    username2.innerHTML = "<i class=\"fa fa-user fa-fw w3-margin-right w3-large w3-text-cyan\"></i>" + data.username;
    email.innerHTML = "<i class=\"fa fa-envelope fa-fw w3-margin-right w3-large w3-text-cyan\"></i>" + data.email;
    username.innerHTML = "<i class=\"fa fa-user\"></i> " + data.username + " <i class=\"fa fa-caret-down\"></i>";
});

function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Currency', '% of portfolio'],
        ['BTC', 60],
        ['ETH', 12],
        ['DOGE', 28]
    ]);

    var options = {
        title: 'Portfolio',
        'backgroundColor': 'transparent',
        slices: {
            0: {color: 'orange'},
            1: {color: 'navy'},
            2: {color: '#FF9966'},
            3: {color: 'blue'},
            4: {color: 'black'},
        },
        'backgroundColor': 'transparent',

        'chartArea': {'width': '100%', 'height': '100%'}

    };

    var chart = new google.visualization.PieChart(document.getElementById('piechart'));

    chart.draw(data, options);
}
