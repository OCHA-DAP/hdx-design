$(document).ready ->
  # Global
  $('#data_group').html "#{data.indicator} <span>-</span> #{data.timestamp} <span>-</span> #{data.region}"

  chart_1 = c3.generate
    bindto: '#chart_1'
    data:
      columns: [
        ['count', data['value']]
      ]
      type: 'gauge'
    gauge:
      label:
        format: (value, ratio) ->
          return value
      min: data['by_region']['min']
      max: data['by_region']['max']
      units: data['units']
    tooltip:
      show: false
  svg = d3.select '#chart_1 svg'
  svg.append 'text'
    .attr 'transform', 'translate(225, 200)'
    .attr 'class', 'chart-title'
    .attr 'text-anchor', 'middle'
    .text 'BY REGION'

  chart_2 = c3.generate
    bindto: '#chart_2'
    data:
      columns: [
        ['count', data['value']]
      ]
      type: 'gauge'
    gauge:
      label:
        format: (value, ratio) ->
          return value
      min: data['by_period']['min']
      max: data['by_period']['max']
      units: data['units']
    tooltip:
      show: false
  svg = d3.select '#chart_2 svg'
  svg.append 'text'
    .attr 'transform', 'translate(225, 200)'
    .attr 'class', 'chart-title'
    .attr 'text-anchor', 'middle'
    .text 'BY PERIOD'

  chart_3 = c3.generate
    bindto: '#chart_3'
    padding:
      top: 40
      bottom: 20
      left: 80
      right: 80
    data:
      columns: [
        ['count', data['value']]
      ]
      type: 'bar'
    bar:
      width:
        ratio: 0.32
    axis:
      x:
        type: 'category'
        categories: [data['region']]
      y:
        min: data['by_region']['min']
        max: data['by_region']['max']
        label: 'count'
    tooltip:
      show: false
    legend:
      show: false
  svg = d3.select '#chart_3 svg'
  svg.append 'text'
    .attr 'transform', 'translate(225, 320)'
    .attr 'class', 'chart-title'
    .attr 'text-anchor', 'middle'
    .text 'BY REGION'

  chart_4 = c3.generate
    bindto: '#chart_4'
    padding:
      top: 0
      bottom: 20
      left: 80
      right: 80
    data:
      columns: [
        ['count', data['value']]
      ]
      type: 'bar'
    bar:
      width:
        ratio: 0.32
    axis:
      x:
        type: 'category'
        categories: [data['region']]
      y:
        min: data['by_period']['min']
        max: data['by_period']['max']
        label: 'count'
    tooltip:
      show: false
    legend:
      show: false
  svg = d3.select '#chart_4 svg'
  svg.append 'text'
    .attr 'transform', 'translate(225, 320)'
    .attr 'class', 'chart-title'
    .attr 'text-anchor', 'middle'
    .text 'BY PEROID'

  return
