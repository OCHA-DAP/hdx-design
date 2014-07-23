requirejs.config({
  paths: {
      jquery: 'lib/jquery.v1.11.1.min',
      bootstrap: 'lib/bootstrap.v3.1.1.min',
      mapbox: 'lib/mapbox.v1.6.4',
      leaflet_omnivore: 'lib/leaflet.omnivore.v0.2.0.min',
      leaflet_fullscreen: 'lib/Leaflet.fullscreen.v0.0.3.min',
      d3: 'lib/d3.v3.min',
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
  chart_colors = ['1ebfb3','117be1', 'f2645a', '555555','ffd700']
  chart_config =
    bindto: '#chart'
    color:
      pattern: chart_colors

  chartUnits = 'per 1,000 female adults'
  chartData = {}
  chartData['x'] = ['1997', '1998', '1999', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011']
  chartData['rate'] = [113.419, 111.6132, 109.8074, 108.0016, 106.1958, 104.39, 102.307, 100.224, 98.141, 96.058, 93.975, 92.4752, 90.9754, 89.4756, 87.9758]

  chart_config.data =
    x: 'x'
    json: chartData
    type: 'area'

  c3.generate chart_config

  $('#chart').on 'click', ()->
    openURL('/indicator.html')

  return
