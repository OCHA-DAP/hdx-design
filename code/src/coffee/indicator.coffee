requirejs.config({
  paths: {
      jquery: 'lib/jquery.v1.11.1.min',
      bootstrap: 'lib/bootstrap.v3.1.1.min',
      mapbox: 'lib/mapbox.v1.6.4',
      leaflet_omnivore: 'lib/leaflet.omnivore.v0.2.0.min',
      leaflet_fullscreen: 'lib/Leaflet.fullscreen.v0.0.3.min',
      d3: 'lib/d3.v3.min'
  },
  shim: {
    'bootstrap': {
      deps: ['jquery']
    },
    'leaflet_omnivore': {
      deps: ['mapbox']
    },
    'leaflet_fullscreen': {
      deps: ['mapbox']
    }
  }
});
require ['jquery',
'bootstrap',
'd3',
'mapbox',
'leaflet_omnivore',
'leaflet_fullscreen',
'data/world_json.js',
'data/regional_codes.js',
'data/countries.js'
], ()->
  $( ()->
    # Global

    # Functions
    openURL = (url) ->
      return window.open(url, '_blank').focus()

    # Chart
    chart_colors = ['1ebfb3','117be1', 'f2645a', '555555','ffd700']
    chart_config =
      bindto: '.chart'
      color:
        pattern: chart_colors
      axis:
        y:
          label:
            text: ''
            position: 'outer-middle'

    chartUnits = 'per 1,000 female adults'
    chartData = {}
    chartData['x'] = ['1997', '1998', '1999', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011']
    chartData['rate'] = [113.419, 111.6132, 109.8074, 108.0016, 106.1958, 104.39, 102.307, 100.224, 98.141, 96.058, 93.975, 92.4752, 90.9754, 89.4756, 87.9758]

    chart_config.data =
      x: 'x'
      json: chartData
      type: 'area'

    chart_config.axis.y.label.text = chartUnits

    c3.generate chart_config

    return
  )
  return
