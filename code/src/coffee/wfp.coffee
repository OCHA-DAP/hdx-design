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
          $("<option value='#{one}'>#{one}</option>").appendTo group_selector
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
      # load map shape data
      jsonQueue = []
      $.getJSON "https://ocha.parseapp.com/getwfpdata?period=#{period_str}&indid=#{indid_str}", (data)->
        console.log "https://ocha.parseapp.com/getwfpdata?period=#{period_str}&indid=#{indid_str}"
        region_selector.empty()
        regions_select_list = {}
        for one in data
          # get map unit
          MAP_UNITS = one['units']
          # console.log one
          region_code = one['region']
          region_name = one['region_name']
          admin1_code = one['admin1']
          admin1_name = one['admin1_name']
          admin2_code = one['admin2']
          admin2_name = one['admin2_name']
          one_value = parseFloat(one['value']).toFixed(1)
          # get map shape path
          download_event = addMapFeature region_code, admin1_code, admin2_code, one_value
          if download_event
            jsonQueue.push download_event

          # create region selection list
          if not regions_select_list[region_code]
            regions_select_list[region_code] =
              name: region_name
              sub_regions: {}
          if admin1_code != 'NA'
            regions_select_list[region_code]['sub_regions'][admin1_code] =
              name: admin1_name
              sub_regions: {}
          if admin2_code != 'NA'
            regions_select_list[region_code]['sub_regions'][admin1_code]['sub_regions'][admin2_code] =
              name:admin2_name
        # create region selection list
        for r_k,r_v of regions_select_list
          if Object.keys(r_v['sub_regions']).length
            region_group_selector = $("<optgroup label='#{r_v['name']}'></optgroup>").appendTo region_selector
            for ad1_k,ad1_v of r_v['sub_regions']
              $("<option value='#{ad1_k}'>#{ad1_v['name']}</option>").appendTo region_group_selector
          else
            $("<option value='#{r_k}'>#{r_v['name']}</option>").appendTo region_selector
        region_selector.trigger "chosen:updated"

  region_selector.change ()->
    regions = $(this).val()
    if regions
      MAP_JSON['features'] = []
      $.when.apply($, jsonQueue).done ()->
        for one in regions
          MAP_JSON['features'].push MAP_SHAPE_DATA[one]
        console.log MAP_JSON

  #
  $('#run').on 'click', ()->
    map.legendControl.addLegend getLegendHTML()
    countryLayer = L.geoJson MAP_JSON,
      style: getStyle,
      onEachFeature: onEachFeature
    countryLayer.addTo map
    map.fitBounds(countryLayer.getBounds());

  # Map Datastore
  jsonQueue = []
  MAP_SHAPE_DATA = {}
  MAP_JSON =
  "type": "FeatureCollection",
  "features": []

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
    feature_name = feature.properties.ADM0_NAME
    if feature.properties.ADM1_NAME
      feature_name = feature.properties.ADM1_NAME
      if feature.properties.ADM2_NAME
        feature_name = feature.properties.ADM2_NAME
    popup.setLatLng e.latlng
    popup.setContent "
    <div class='marker-container'>
    <div class='marker-number'>#{feature.properties.value}</div>
      <div class='marker-label'>#{feature_name}</div>
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
  addMapFeature = (r, ad1, ad2, v) ->
    file_key = r
    file_path = "#{FILE_LINK}/#{r}.json"
    if ad2 != 'NA'
      file_key = ad2
      file_path = "#{FILE_LINK}/#{r}/#{ad1}/#{ad2}.json"
    else if ad1 != 'NA'
      file_key = ad1
      file_path = "#{FILE_LINK}/#{r}/#{ad1}.json"
    if MAP_SHAPE_DATA[file_key]
      one_feature = MAP_SHAPE_DATA[file_key]
      one_feature['properties']['value'] = v
      # MAP_JSON['features'].push one_feature
      return null
    else
      return $.getJSON file_path, (map_json)->
        map_json['properties']['value'] = v
        MAP_SHAPE_DATA[file_key] = map_json
        # MAP_JSON['features'].push map_json

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
