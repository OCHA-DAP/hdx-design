$(document).ready ->
  # Global
  $('#data_group').html "#{data.indicator} <span>-</span> (     #{data.earliest} - #{data.latest}) <span>-</span> #{data.region}"
  # Functions
  chart_add_text = (chart, text, x, y)->
    svg = d3.select "#{chart} svg"
    svg.append 'text'
    .attr 'transform', "translate(#{x}, #{y})"
    .attr 'class', 'chart-title'
    .attr 'text-anchor', 'middle'
    .text text
    return

  chartData = {}
  chartData['x'] = data.values.period
  chartData['count'] = data.values.value
  # console.log chartData
  chart_1 = c3.generate
    padding:
      top: 40
    bindto: '#chart_1'
    data:
      x: 'x'
      json: chartData
      type: 'line'
  chart_add_text '#chart_1', data.indicator, 300, 20

  return
