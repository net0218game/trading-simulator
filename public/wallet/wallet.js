let socket = io.connect('http://localhost:5000');

let chartArray = []

google.charts.load('current', {'packages': ['corechart']});
google.charts.setOnLoadCallback(drawChart);

var intervalId = window.setInterval(function () {
    drawChart()
}, 1000);

let tokens2 = document.getElementById("tokens2");
let username = document.getElementById("name");
let username2 = document.getElementById("name2");
let email = document.getElementById("email");

let stat = document.getElementById("statistics");
let profit = document.getElementById("profit");

socket.on("userdata", function (data) {
    if (data.email.length > 0) {
        email.innerHTML = "<i class=\"fa fa-envelope fa-fw w3-margin-right w3-large w3-text-cyan\"></i>" + data.email;
    } else {
        email.innerHTML = "<i class=\"fa fa-envelope fa-fw w3-margin-right w3-large w3-text-cyan\"></i> You don't have any email linked to this account";
    }
    tokens2.innerHTML = "<i class=\"fa fa-money fa-fw w3-margin-right w3-large w3-text-cyan\"></i>" + data.tokens;
    username2.innerHTML = "<i class=\"fa fa-user fa-fw w3-margin-right w3-large w3-text-cyan\"></i>" + data.username;
    username.innerHTML = "<i class=\"fa fa-user\"></i> " + data.username + " <i class=\"fa fa-caret-down\"></i>";
});

socket.on("portfolio", function (data) {
    chartArray = [['Currency', '% of portfolio']]
    let sum = 0;
    for (let i = 0; i < data.portfolio.length; i++) {
        console.log("coin", data.portfolio[i][0])
        chartArray.push([data.portfolio[i][0].toUpperCase(), data.portfolio[i][3]])
        sum += data.portfolio[i][3];
    }

    for (let i = 0; i < data.portfolio.length; i++) {
        let percent = ((data.portfolio[i][3] / sum) * 100);
        console.log(data.portfolio[i][0].toUpperCase(), percent)
        let other = 0;
        let otherCoins = "";
        if (percent > 1) {
            stat.innerHTML = stat.innerHTML + '<p>' + data.portfolio[i][0].toUpperCase() + '</p>\n' +
                '                    <div class="w3-light-grey w3-round-xlarge w3-small">\n' +
                '                        <div class="w3-container w3-center w3-round-xlarge w3-cyan" style="width:' + percent + '%">\n' +
                '                            <div class="w3-center w3-text-black">' + percent.toFixed(1) + '%</div>\n' +
                '                        </div>\n' +
                '                    </div>'
        } else {
            otherCoins += data.portfolio[i][0].toUpperCase() + " ";
            other += percent
            let otherDiv = document.getElementById("other");
            if (!otherDiv) {
                stat.innerHTML = stat.innerHTML + '<p>Other: ' + otherCoins + '</p>\n' +
                    '                    <div class="w3-light-grey w3-round-xlarge w3-small">\n' +
                    '                        <div class="w3-container w3-center w3-round-xlarge w3-cyan" style="width:' + other + '%">\n' +
                    '                            <div class="w3-center w3-text-black" id="other">' + other.toFixed(1) + '%</div>\n' +
                    '                        </div>\n' +
                    '                    </div>'
            } else {
                otherDiv.innerText = other + "%";
            }
        }
    }


    stat.innerHTML = stat.innerHTML + "<br><hr>"
    console.log(chartArray)
    if (data.userinfo.token > data.initialValue) {
        let userProfit = data.userinfo.token - data.initialValue;
        profit.innerHTML = '<p id="profit" class="w3-text-grey w3-padding-1 w3-large"><i\n' +
            '                            class="fa fa-plus fa-fw w3-margin-right w3-xlarge w3-text-cyan"></i>Profit made: $' + userProfit + '</p>';
    } else {
        profit.innerHTML = '<p id="profit" class="w3-text-grey w3-padding-1 w3-large"><i\n' +
            '                            class="fa fa-plus fa-fw w3-margin-right w3-xlarge w3-text-cyan"></i>No profit yet!</p>';
    }
    drawChart()
});

function drawChart() {
    let data = google.visualization.arrayToDataTable(chartArray);

    let options = {
        title: 'Portfolio',
        'backgroundColor': 'transparent',
        slices: {
            0: {color: '#d0f5fc'},
            1: {color: '#9debff'},
            2: {color: '#59d4ff'},
            3: {color: '#3badfc'},
            4: {color: '#0096fe'}
        },
        'backgroundColor': 'transparent',
        'chartArea': {'width': '90%', 'height': '90%'},
        pieSliceTextStyle: {
            color: 'black'
        }
    };

    let chart = new google.visualization.PieChart(document.getElementById('piechart'));

    chart.draw(data, options);
}
