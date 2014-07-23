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
'data/mortality.js'
], ()->
  $( ()->
    # Global
    # Code
    country_code = location.search.split('code=')[1]
    if not country_code
      country_code = 'COL'
    else
      country_code = country_code.toUpperCase()

    country_name = ''
    for one in regional_codes
      if one['alpha-3'] == country_code
        country_name = one['name']
        break

    # Functions
    openURL = (url) ->
      return window.open(url, '_blank').focus()

    # Chart
    chart_colors = ['555555', '1ebfb3']
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
    mortalityData = []
    if mortality_rates[country_code]
      mortalityData = mortality_rates[country_code]
    else
      mortalityData = mortality_rates['default']
    chartData['year'] = mortalityData['year']
    globalRate = []
    for one in chartData['year']
      for index, another of mortality_rates['global']['year']
        if one == another
          globalRate.push(mortality_rates['global']['rate'][index])
          break
    chartData['Global'] = globalRate
    chartData[country_name] = mortalityData['rate']

    chart_config.data =
      x: 'year'
      json: chartData
      type: 'area'

    chart_config.axis.y.label.text = chartUnits

    c3.generate chart_config

    return
  )
  return
