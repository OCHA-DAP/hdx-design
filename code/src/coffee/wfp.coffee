requirejs.config({
  paths: {
      jquery: 'lib/jquery.v1.11.1.min',
      bootstrap: 'lib/bootstrap.v3.1.1.min',
      mapbox: 'https://api.tiles.mapbox.com/mapbox.js/v1.6.4/mapbox',
      leaflet_omnivore: 'lib/leaflet.omnivore.v0.2.0.min',
      leaflet_fullscreen: 'lib/Leaflet.fullscreen.v0.0.3.min',
      chroma: 'lib/chroma.min',
      d3: 'lib/d3.v3.min',
      c3: 'lib/c3.v0.2.4',
      chosen: 'lib/chosen.v1.1.min'
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
    },
    'chosen': {
      deps: ['bootstrap', 'jquery']
    }
  }
});
require ['jquery',
'bootstrap',
'mapbox',
'leaflet_omnivore',
'leaflet_fullscreen',
'd3',
'c3',
'chroma',
'chosen'
], ($, b, m, o, f, d3, c3, chroma)->

  # Chosen js optgroup select
  $(document).on 'click', '.group-result', ()->
    $this = $(this)
    unselected = $this.nextUntil('.group-result').not('.result-selected')
    if unselected.length
      unselected.trigger 'mouseup'
    else
      $this.nextUntil('.group-result').each ()->
        $("a.search-choice-close[data-option-array-index='#{$this.data('option-array-index')}']").trigger 'click'

  # selections
  $('.chosen-select').chosen
    no_results_text: "Oops, nothing found!"

  indicator_selector = $('#chosen_indicators')
  peroid_selector = $('#chosen_peroids')
  region_selector = $('#chosen_regions')

  # indicators
  indid_str = ''
  indicator_selector.change ()->
    indids = $(this).val()
    if indids
      indid_str = indids.join(',')
      $.getJSON "https://ocha.parseapp.com/getwfpperiods?indid=#{indid_str}", (data)->
        console.log data
        peroid_selector.empty()
        group_selector = $("<optgroup label='All'></optgroup>").appendTo peroid_selector
        for one in data
          $("<option value='#{one}' selected>#{one}</option>").appendTo group_selector
        peroid_selector.trigger "chosen:updated"
    else
      indid_str = ''
      peroid_selector.empty()
      peroid_selector.trigger "chosen:updated"

  # peroids
  period_str = ''
  peroid_selector.change ()->
    periods = $(this).val()
    if periods
      period_str = periods.join(',')

  $('#run').on 'click', ()->
    loadMapData()

  loadMapData = ()->
    $.getJSON "https://ocha.parseapp.com/getwfpdata?period=#{period_str}&indid=#{indid_str}", (data)->
      jsonQueue = []
      for one in data
        console.log one
        MAP_UNITS = one['units']
        file = getMapFilePath(one)
        jsonQueue.push(
          $.getJSON file, (map_json)->
            for one in data
              if one['region'] == map_json['properties']['alpha-3']
                map_json['properties']['value'] = parseInt one['value']
                break
            MAP_JSON['features'].push map_json
        )
      map.legendControl.addLegend getLegendHTML()
      $.when.apply($, jsonQueue).done ()->
        console.log MAP_JSON
        countryLayer = L.geoJson MAP_JSON,
          style: getStyle,
          onEachFeature: onEachFeature
        countryLayer.addTo map
        map.fitBounds(countryLayer.getBounds());

  # Global
  # mapID = 'xyfeng.ijpo6lio'
  # mapID = 'yumiendo.ijchbik8'
  mapID = 'yumiendo.j1majbom'
  MAP_UNITS = 'percent'

  # colors
  COLOR_LEVELS = 5
  # color_map = [
  #   '#feebe2',
  #   '#fbb4b9',
  #   '#f768a1',
  #   '#c51b8a',
  #   '#7a0177',
  # ]
  color_scale = chroma.scale(['#fcbba1','#67000d']).mode('hsl').correctLightness(true).out('hex')
  color_map = []
  for i in [0..COLOR_LEVELS] by 1
    color_map.push color_scale(i / parseFloat(COLOR_LEVELS))
  console.log color_map


  # Functions
  openURL = (url) ->
    return window.open(url, '_blank').focus()

  getColor = (v) ->
    index = Math.floor(v / (100 / COLOR_LEVELS))
    color_map[index]

  getStyle = (feature) ->
    weight: 0,
    fillOpacity: 1,
    fillColor: getColor(feature.properties.value)

  getLegendHTML = ()->
    labels = []
    label_range = 100 / COLOR_LEVELS
    for i in [0..COLOR_LEVELS-1] by 1
      from = i * label_range
      to = (i+1) * label_range
      labels.push "<li><span class='swatch' style='background:#{getColor(from)}'></span>#{from}-#{to}</li>"
    "<span>#{MAP_UNITS}</span><ul>#{labels.join('')}</ul"

  closeTooltip = window.setTimeout ()->
    map.closePopup()
  , 100
  highlightFeature = (e) ->
    layer = e.target
    feature = layer.feature
    countryID = layer.feature.id
    layer.setStyle
      weigth:1
      opacity: 0.2
      color: '#ccc'
      fillOpacity: 1.0
      fillColor: '#000'
    # tooltip
    popup.setLatLng e.latlng
    popup.setContent "
    <div class='marker-container'>
    <div class='marker-number'>#{feature.properties.value}</div>
      <div class='marker-label'>#{MAP_UNITS}</div>
    </div>
    "
    if !popup._map
      popup.openOn map
    window.clearTimeout closeTooltip
    return

  resetFeature = (e) ->
    layer = e.target
    layer_style = getStyle layer.feature
    layer.setStyle layer_style
    closeTooltip = window.setTimeout ()->
      map.closePopup()
    , 100
    return

  featureClicked = (e) ->
    layer = e.target
    code = layer.feature.id.toLowerCase()
    openURL("country.html?code=#{code}")
    return

  onEachFeature = (feature, layer) ->
    layer.on
      mousemove: highlightFeature,
      mouseout: resetFeature,
      click: featureClicked
    return

  # Code
  FILE_LINK = 'data/fao/country'
  getMapFilePath = (dic) ->
    if dic['admin2'] != 'NA'
      return "#{FILE_LINK}/#{dic['region']}/#{dic['admin1']}/#{dic['admin2']}.json"
    if dic['admin1'] != 'NA'
      return "#{FILE_LINK}/#{dic['region']}/#{dic['admin1']}.json"
    else
      return "#{FILE_LINK}/#{dic['region']}.json"
  MAP_JSON =
    "type": "FeatureCollection",
    "features": []


  # create map
  map = L.mapbox.map 'map', mapID,
    center: [20, 0]
    zoom: 2
    minZoom: 2
    maxZoom: 8
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

  # re-order layers
  topPane = map._createPane 'leaflet-top-pane', map.getPanes().mapPane
  topLayer = L.mapbox.tileLayer mapID
  topLayer.addTo map
  topPane.appendChild topLayer.getContainer()
  topLayer.setZIndex 7

  return
