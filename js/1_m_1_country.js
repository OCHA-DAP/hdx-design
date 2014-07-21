(function() {
  $(document).ready(function() {
    var chartData, chart_1, chart_add_text;
    $('#data_group').html("" + data.indicator + " <span>-</span> (     " + data.earliest + " - " + data.latest + ") <span>-</span> " + data.region);
    chart_add_text = function(chart, text, x, y) {
      var svg;
      svg = d3.select("" + chart + " svg");
      svg.append('text').attr('transform', "translate(" + x + ", " + y + ")").attr('class', 'chart-title').attr('text-anchor', 'middle').text(text);
    };
    chartData = {};
    chartData['x'] = data.values.period;
    chartData['count'] = data.values.value;
    chart_1 = c3.generate({
      padding: {
        top: 40
      },
      bindto: '#chart_1',
      data: {
        x: 'x',
        json: chartData,
        type: 'line'
      }
    });
    chart_add_text('#chart_1', data.indicator, 300, 20);
  });

}).call(this);
