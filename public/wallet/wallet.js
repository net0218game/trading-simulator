let back = document.getElementById("back");

back.addEventListener("click", function () {
    window.location.replace("/main");
});

google.charts.load('current', {'packages': ['corechart']});
google.charts.setOnLoadCallback(drawChart);

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
          0: { color: 'orange' },
          1: { color: 'navy' },
          2: { color: '#FF9966' },
          3: { color: 'blue' },
          4: { color: 'black' },
        }

    };

    var chart = new google.visualization.PieChart(document.getElementById('piechart'));

    chart.draw(data, options);
}
