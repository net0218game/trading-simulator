let socket = io.connect('http://localhost:5000');

let back = document.getElementById("back");

let chartArray = []

back.addEventListener("click", function () {
    window.location.replace("/main");
});

google.charts.load('current', {'packages': ['corechart']});
google.charts.setOnLoadCallback(drawChart);



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

socket.on("portfolio", function (data) {
    chartArray = [['Currency', '% of portfolio']]

    for(let i = 0; i < data.portfolio.length; i++) {
        console.log("coin", data.portfolio[i][0])
        chartArray.push([data.portfolio[i][0], data.portfolio[i][3]])
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
            0: {color: 'orange'},
            1: {color: 'navy'},
            2: {color: '#FF9966'},
            3: {color: 'blue'},
            4: {color: 'black'},
        },
        'backgroundColor': 'transparent',

        'chartArea': {'width': '90%', 'height': '90%'}

    };

    let chart = new google.visualization.PieChart(document.getElementById('piechart'));

    chart.draw(data, options);
}
