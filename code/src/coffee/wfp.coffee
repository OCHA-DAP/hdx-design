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
'leaflet_fullscreen'
], (d3, c3)->
  # Global
  # mapID = 'xyfeng.ijpo6lio'
  # mapID = 'yumiendo.ijchbik8'
  mapID = 'yumiendo.j1majbom'

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
  getMapFilePath = (dic) ->
    if dic['admin2'] != 'NA'
      return "#{dic['region']}/#{dic['admin1']}/#{dic['admin2']}.json"
    if dic['admin1'] != 'NA'
      return "#{dic['region']}/#{dic['admin1']}.json"
    else
      return "#{dic['region']}.json"
  $.getJSON 'http://ocha.parseapp.com/getmapdata?period=2009&indid=CHD.B.FOS.04.T6', (data)->
    for one in data
      console.log one
      file = getMapFilePath(one)
      console.log file

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

  # countryLayer = L.geoJson worldJSON,
  #   style: getStyle,
  #   onEachFeature: onEachFeature
  # countryLayer.addTo map

  # re-order layers
  topPane = map._createPane 'leaflet-top-pane', map.getPanes().mapPane
  topLayer = L.mapbox.tileLayer mapID
  topLayer.addTo map
  topPane.appendChild topLayer.getContainer()
  topLayer.setZIndex 7

  return
