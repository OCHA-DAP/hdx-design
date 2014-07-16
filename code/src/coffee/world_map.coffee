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

  global_projection = d3.geo.mercator();
  region_path = d3.geo.path().projection(global_projection);
  region_width = 80
  region_height = 60
  for feature in worldJSON.features
    countryName = feature.properties.name
    countryID = feature.id
    countryCode = feature.code
    if countryCode
      countryCode = countryCode.toLowerCase()
    list = $('#country_list')
    one = $(`'<div class="col-md-3 country-box" id="region_'+ countryID +'"></div>'`).appendTo list
    svg = d3.select "#region_#{countryID}"
    .append 'svg'
    .attr 'width', region_width
    .attr 'height', region_height
    bounds = region_path.bounds(feature)
    scale = global_projection.scale() * d3.min([ region_width / (bounds[1][0]-bounds[0][0]), region_height / (bounds[1][1]-bounds[0][1]) ]) * 0.75;
    center = global_projection.invert(region_path.centroid(feature))
    region_projection = d3.geo.mercator().center(center).scale(scale).translate([region_width/2, region_height/2])
    svg.append 'path'
    .datum feature
    .attr 'class', 'region-path'
    .attr 'd', d3.geo.path().projection(region_projection)
    $('<a>'+countryName+'</a>').appendTo one
    $(`'<label class="region-flag"><span class="flag-icon flag-icon-'+ countryCode +'"></span></label>'`).appendTo one
  return
