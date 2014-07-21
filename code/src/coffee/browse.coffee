#wpx data

$(document).ready ->
  # Global
  mapID = 'xyfeng.ijpo6lio'
  # mapID = 'yumiendo.ijchbik8'

  # Functions
  getStyle = (feature) ->
    {
      weight: 0,
      fillOpacity: 1,
      fillColor: '#fff'
    }

  closeTooltip = window.setTimeout ()->
    map.closePopup()
  , 100
  highlightFeature = (e) ->
    layer = e.target
    countryID = layer.feature.id
    layer.setStyle
      weigth:1
      opacity: 0.2
      color: '#ccc'
      fillOpacity: 1.0
      fillColor: '#f5837b'
    # tooltip
    popup.setLatLng e.latlng
    popup.setContent "<div class='marker-title'>#{layer.feature.properties.name}</div>#{layer.feature.properties.value} datasets"
    if !popup._map
      popup.openOn map
    window.clearTimeout closeTooltip
    return

  resetFeature = (e) ->
    layer = e.target
    layer.setStyle
      weigth:0
      fillOpacity: 1.0
      fillColor: '#fff'
    closeTooltip = window.setTimeout ()->
      map.closePopup()
    , 100
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
  # get data
  for feature in worldJSON['features']
    country_id = feature.id
    first_letter = country_id.substring(0, 1)
    feature.properties.value = 0
    if countries[first_letter]
      for country in countries[first_letter]
        if country[0] == country_id
          feature.properties.value = country[2]
          console.log country[2]
          break
    # console.log feature.properties.value

  # create map
  map = L.mapbox.map 'map', mapID,
    center: [20, 10]
    zoom: 2
    minZoom: 2
    maxZoom: 4
    tileLayer:
       continuousWorld: false
       noWrap: true

  # map.dragging.disable()
  # map.touchZoom.disable()
  # map.doubleClickZoom.disable()
  map.scrollWheelZoom.disable()

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

  # console.log map

  columns = [
    ['A', 'B', 'C'],
    ['D', 'E', 'F', 'G','H'],
    ['I','J','K','L'],
    ['M','N','O','P'],
    ['Q', 'R', 'S', 'T'],
    ['U', 'V', 'Y', 'Z'],
  ]

  country_list = $('#country_list')
  for column in columns
    one_column = $('<div class="col-md-2"></div>').appendTo(country_list)
    for char in column
      one_char_box = $("<div class='char-box'></div>").appendTo(one_column)
      one_char_labe = $("<div class='char-label'>#{char}</div>").appendTo(one_char_box)
      for country in countries[char]
        if country[2] == 0
          $("<div class='country-item inactive'>#{country[1]}</div>").appendTo(one_char_box)
        else
          $("<div class='country-item'>#{country[1]}</div>").appendTo(one_char_box)
