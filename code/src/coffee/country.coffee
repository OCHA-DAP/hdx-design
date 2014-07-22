#wfp data

$(document).ready ->
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
    # console.log code + ' is clicked'
    # openURL("http://data.hdx.rwlabs.org/group/#{code}")
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
