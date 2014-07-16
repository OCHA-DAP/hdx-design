$(document).ready ->
  # Global
  mapID = 'xyfeng.ijpo6lio'

  # Functions
  getStyle = (feature) ->
    {
      weight: 0,
      fillOpacity: 1,
      fillColor: '#fff'
    }

  highlightFeature = (e) ->
    layer = e.target
    countryID = layer.feature.id
    layer.setStyle
      weigth:1
      opacity: 0.2
      color: '#ccc'
      fillOpacity: 1.0
      fillColor: '#eee'
    return

  resetFeature = (e) ->
    layer = e.target
    layer.setStyle
      weigth:0
      fillOpacity: 1.0
      fillColor: '#fff'
    return

  featureClicked = (e) ->
    layer = e.target
    countryName = layer.feature.properties.name
    console.log countryName + ' is clicked'
    return

  onEachFeature = (feature, layer) ->
    layer.on
      mousemove: highlightFeature,
      mouseout: resetFeature,
      click: featureClicked
    return

  # Code
  map = L.mapbox.map 'map', mapID,
    center: [20, 10]
    zoom: 2
    minZoom: 2
    maxZoom: 4
    tileLayer:
       continuousWorld: false
       noWrap: true

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

  console.log map

  for feature in worldJSON.features
    countryName = feature.properties.name
    list = $('#country_list')
    $('<div class="col-md-3 country-box"><a>'+countryName+'</a></div>').appendTo list
  return
