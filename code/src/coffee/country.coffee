requirejs.config({
  paths: {
      jquery: 'lib/jquery.v1.11.1.min',
      bootstrap: 'lib/bootstrap.v3.1.1.min',
      mapbox: 'lib/mapbox.v1.6.4',
      leaflet_omnivore: 'lib/leaflet.omnivore.v0.2.0.min',
      leaflet_fullscreen: 'lib/Leaflet.fullscreen.v0.0.3.min',
      d3: 'lib/d3.v3.min',
      c3: 'lib/c3.v0.2.4'
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
    },
    'c3': {
      deps: ['d3']
    }
  }
});
require ['d3','c3',
'jquery',
'bootstrap',
'mapbox',
'leaflet_omnivore',
'leaflet_fullscreen',
'data/world_json.js',
'data/regional_codes.js',
'data/mortality.js'
], (d3, c3)->
  # Global
  # mapID = 'xyfeng.ijpo6lio'
  mapID = 'yumiendo.ijchbik8'

  # Functions
  openURL = (url) ->
    return window.open(url, '_blank').focus()
  getStyle = (feature) ->
    if feature.id == country_code
      weight: 1,
      opacity: 0.2
      fillOpacity: 1,
      fillColor: '#f5837b'
    else
      weight: 0,
      fillOpacity: 1,
      fillColor: '#f2f2ef'

  highlightFeature = (e) ->
    layer = e.target
    countryID = layer.feature.id
    layer.setStyle
      weigth:1
      opacity: 0.2
      color: '#ccc'
      fillOpacity: 1.0
      fillColor: '#f5837b'
    return

  resetFeature = (e) ->
    layer = e.target
    layer_style = getStyle layer.feature
    layer.setStyle layer_style
    return

  featureClicked = (e) ->
    layer = e.target
    code = layer.feature.id.toLowerCase()
    openURL("country.html?code=#{code}")
    return

  onEachFeature = (feature, layer) ->
    #zoom to feature
    if feature.id == country_code
      country_name = feature.properties.name
      $('#title_label').html country_name
      map.fitBounds(layer.getBounds())
    #layer events
    layer.on
      mousemove: highlightFeature,
      mouseout: resetFeature,
      click: featureClicked
    return

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

  # create map
  map = L.mapbox.map 'map', mapID,
    center: [20, 0]
    zoom: 2
    minZoom: 2
    maxZoom: 4
    tileLayer:
       continuousWorld: false
       noWrap: false

  # map.dragging.disable()
  # map.touchZoom.disable()
  # map.doubleClickZoom.disable()
  map.scrollWheelZoom.disable()
  # add full screen
  L.control.fullscreen().addTo(map);

  # hide all markers
  map.featureLayer.setFilter ->
    return false

  popup = new L.Popup
    autoPan: false

  countryLayer = L.geoJson worldJSON,
    style: getStyle,
    onEachFeature: onEachFeature
  countryLayer.addTo map

  # re-order layers
  topPane = map._createPane 'leaflet-top-pane', map.getPanes().mapPane
  topLayer = L.mapbox.tileLayer mapID
  topLayer.addTo map
  topPane.appendChild topLayer.getContainer()
  topLayer.setZIndex 7

  # Chart
  chart_colors = ['555555', '1ebfb3']
  chart_config =
    bindto: '#chart'
    color:
      pattern: chart_colors
    axis:
      x:
        tick:
          culling:
            max: 4

  chartUnits = 'per 1,000 female adults'
  chartData = {}
  mortalityData = []
  if mortality_rates[country_code]
    mortalityData = mortality_rates[country_code]
  else
    mortalityData = mortality_rates['default']
  # set latest data
  data_length = mortalityData['year'].length
  $('#latest_data').html("#{mortalityData['rate'][data_length-1].toFixed(1)} <span>/#{mortalityData['year'][data_length-1]}</span>")
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

  c3.generate chart_config

  $('#chart').on 'click', ()->
    openURL('indicator.html?code='+country_code.toLowerCase())

  return
