#wfp data

$(document).ready ->
  # Global
  # mapID = 'xyfeng.ijpo6lio'
  mapID = 'yumiendo.ijchbik8'

  # Functions
  openURL = (url) ->
    return window.open(url, '_blank').focus()
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
    popup.setContent "
    <div class='marker-container'>
      <div class='marker-box'>
        <div class='marker-number'>#{layer.feature.properties.indicators}</div>
        <div class='marker-label'>indicators</div>
      </div>
      <div class='line-break'></div>
      <div class='marker-box'>
        <div class='marker-number'>#{layer.feature.properties.datasets}</div>
        <div class='marker-label'>datasets</div>
      </div>
    </div>
    "
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
    code = layer.feature.id.toLowerCase()
    # console.log code + ' is clicked'
    openURL("http://data.hdx.rwlabs.org/group/#{code}")
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
    feature.properties.datasets = 0
    feature.properties.indicators = 0
    for k, v of countries
      for country in v
        if country[0] == country_id
          feature.properties.datasets = country[2]
          feature.properties.indicators = country[3]
          break

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
        if country.length == 2
          $("<div class='country-item inactive'>#{country[1]}</div>").appendTo(one_char_box)
        else
          code = country[0].toLowerCase()
          $("<div class='country-item' data-code='#{code}'>#{country[1]}</div>").appendTo(one_char_box)
  $('.country-item').on 'click', (e)->
    code = $(this).data('code')
    if code
      openURL("http://data.hdx.rwlabs.org/group/#{code}")
    return
  return
