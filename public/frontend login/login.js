var socket = io.connect('http://localhost:4000');

let values = []

socket.on("data", function (data) {
    values = data.values;
    chart();
});


function chart() {
    google.charts.load('current', {packages: ['corechart', 'line']});
    google.charts.setOnLoadCallback(drawBasic);

    function drawBasic() {

        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Time');
        data.addColumn('number', 'BTC');

        data.addRows(values);

        var options = {
            hAxis: {
                title: 'Time\nDate, H:M:S'
            }, vAxis: {
                title: 'Price'
            },
            'backgroundColor': 'transparent'
        };

        var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

        chart.draw(data, options);
    }
}