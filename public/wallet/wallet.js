let socket = io.connect('http://localhost:5000');

let chartArray = []

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
    if(data.email.length > 0) {
        email.innerHTML = "<i class=\"fa fa-envelope fa-fw w3-margin-right w3-large w3-text-cyan\"></i>" + data.email;
    } else {
        email.innerHTML = "<i class=\"fa fa-envelope fa-fw w3-margin-right w3-large w3-text-cyan\"></i> You don't have any email linked to this account";
    }
    tokens.innerHTML = data.tokens + "<i class=\"fa fa-money fa-fw w3-margin-right w3-large w3-text\"></i>";
    tokens2.innerHTML = "<i class=\"fa fa-money fa-fw w3-margin-right w3-large w3-text-cyan\"></i>" + data.tokens;
    username2.innerHTML = "<i class=\"fa fa-user fa-fw w3-margin-right w3-large w3-text-cyan\"></i>" + data.username;
    username.innerHTML = "<i class=\"fa fa-user\"></i> " + data.username + " <i class=\"fa fa-caret-down\"></i>";
});

socket.on("portfolio", function (data) {
    chartArray = [['Currency', '% of portfolio']]

    for(let i = 0; i < data.portfolio.length; i++) {
        console.log("coin", data.portfolio[i][0])
        chartArray.push([data.portfolio[i][0].toUpperCase(), data.portfolio[i][3]])
    }
    console.log(chartArray)

    drawChart()
});

function drawChart() {
    let data = google.visualization.arrayToDataTable(chartArray);

    let options = {
        title: 'Portfolio',
        'backgroundColor': 'transparent',
        slices: {
            0: {color: '#04009A'},
            1: {color: '#77ACF1'},
            3: {color: '#3EDBF0'},
            4: {color: '#C0FEFC'}
        },
        'backgroundColor': 'transparent',

        'chartArea': {'width': '90%', 'height': '90%'}

    };

    let chart = new google.visualization.PieChart(document.getElementById('piechart'));

    chart.draw(data, options);
}
