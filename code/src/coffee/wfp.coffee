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
      chosen: 'lib/chosen.v1.1.min',
      bonsai: 'lib/tree/jquery.bonsai',
      qubit: 'lib/tree/jquery.qubit'
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
    },
    'qubit': {
      deps: ['jquery']
    },
    'bonsai': {
      deps: ['jquery', 'qubit']
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
'chosen',
'bonsai',
'qubit'
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

  # GLOBAL
  # data
  dataDownloadQueue = []
  RAW_DATA = {}
  DATA_UNITS = 'percent'
  c3_chart = null
  # map
  mapDownloadQueue = []
  mapID = 'yumiendo.j1majbom'#'yumiendo.ijchbik8''xyfeng.ijpo6lio'
  featureLayer = null
  mapLegend = null
  MAP_SHAPE_DATA = {}
  MAP_JSON =
  "type": "FeatureCollection",
  "features": []
  MAP_FILE_LINK = 'data/fao/country'
  # create map
  map = L.mapbox.map 'map', mapID,
    center: [20, 0]
    zoom: 2
    minZoom: 2
    maxZoom: 10
    tileLayer:
      continuousWorld: false
      noWrap: false
  map.scrollWheelZoom.disable()
  map.on 'load', ()->
    console.log '11111'
  # add full screen
  L.control.fullscreen().addTo(map);
  # hide all markers
  map.featureLayer.setFilter ->
    return false
  # popup layer
  popup = new L.Popup
    autoPan: false

  # re-order layers
  topPane = map._createPane 'leaflet-top-pane', map.getPanes().mapPane
  topLayer = L.mapbox.tileLayer mapID
  topLayer.addTo map
  topPane.appendChild topLayer.getContainer()
  topLayer.setZIndex 7
  # colors
  COLOR_LEVELS = 5
  color_scale = chroma.scale(['#fcbba1','#67000d']).mode('hsl').correctLightness(true).out('hex')
  color_map = []
  for i in [0..COLOR_LEVELS] by 1
    color_map.push color_scale(i / parseFloat(COLOR_LEVELS))

  # logics
  createNavTree = ()->
    $('#chosen_regions').bonsai
      checkboxes: true
    for one in $('#chosen_regions li[data-children]')
      one_count = $(one).data('children')
      $(one).find('>input').next().before "<span>#{one_count}</span>"
    return
  updateState = (new_state)->
    console.log "update state to #{new_state}"
    CURR_STATE = new_state
    if new_state == STATE_NONE
      map_container.hide()
      chart_container.hide()
    else if new_state == STATE_MAP
      map_container.show()
      chart_container.hide()
    else
      map_container.hide()
      chart_container.show()
    return
  indicator_selector = $('#chosen_indicators')
  period_selector = $('#chosen_periods')
  region_selector = $('#chosen_regions')
  map_container = $('#map_container')
  chart_container = $('#chart_container')
  STATE_NONE = 0
  STATE_BAR = 1
  STATE_LINE = 2
  STATE_MAP = 3
  STATE_PIE = 4
  STATE_RADAR = 5
  STATE_SCATTER = 6
  CURR_STATE = STATE_NONE

  # charts
  addTextToChart = (svg, text, text_class, x, y)->
    svg.append 'text'
      .attr 'transform', "translate(#{x}, #{y})"
      .attr 'class', text_class
      .attr 'text-anchor', 'middle'
      .text text
    return
  createPieChart = ()->
    name = checked_regions[0]['name']
    value = checked_regions[0]['value']
    if c3_chart
      c3_chart.destroy()
    $('#chart').removeClass 'line'
    .removeClass 'bar'
    .addClass 'pie'
    chart_config =
      bindto: '#chart'
      padding:
        top: 30
        bottom: 20
      color:
        pattern: ['1ebfb3','eee']
      data:
        columns: [
          [name, value],
          ['others', 100-value]
        ]
        type: 'pie'
      legend:
        show: false
      tooltip:
        show: false
    c3_chart = c3.generate chart_config
    svg = d3.select "#chart svg"
    addTextToChart svg, name, 'chart-title', 380, 20
    addTextToChart svg, value, 'chart-value', 380, 305
    addTextToChart svg, DATA_UNITS, 'chart-unit', 380, 315
    return
  createLineChart = ()->
    chart_data = {}
    chart_data['categories'] = periods.sort()
    chart_data['columns'] = []
    for one in checked_regions
      one_values = getValuesForPath(one['path'])
      chart_data['columns'].push [one['name']].concat(one_values)
    # console.log chart_data
    if c3_chart
      c3_chart.destroy()
    $('#chart').removeClass 'pie'
    .removeClass 'bar'
    .addClass 'line'
    chart_config =
      bindto: '#chart'
      padding:
        top: 30
        bottom: 20
        padding: 60
      data:
        columns: chart_data['columns']
        type: 'line'
      axis:
        x:
          type: 'category'
          categories:chart_data['categories']
    c3_chart = c3.generate chart_config
    return
  updateState STATE_NONE
  # updateState STATE_LINE
  # chart_data =
  #   'period': ['2008', '2009', '2010', '2011']
  #   'value': [1.8, null, 2, 3]
  # createLineChart '#chart', 'name', chart_data

  # indicators
  indids = []
  periods = []
  regions = {}
  checked_regions = []
  indicator_selector.change ()->
    indids = $(this).val()
    if not indids
      indids = []
    downloadData()
    return
  # periods
  $(document).on 'click','#chosen_periods .checkbox-inline input',()->
    periods = []
    for one in $('#chosen_periods .checkbox-inline input:checked')
      periods.push one.value
    getRegions()
    return
  # region
  createNavTree()
  $(document).on 'click','#chosen_regions input',()->
    # console.log $('#chosen_regions input:checked').data('value')
    checked_regions = []
    mapDownloadQueue = []
    MAP_JSON['features'] = []
    for one in $('#chosen_regions input:checked')
      one_value = $(one).data('value')
      one_path = $(one).data('path')
      one_key = $(one).data('key')
      one_name = $(one).parent().text()
      if one_path
        checked_regions.push
          key: one_key
          path: one_path
          value: one_value
          name: one_name
        map_download_event = addMapFeature one_path, one_value
        if map_download_event
          mapDownloadQueue.push map_download_event
    # console.log checked_regions
    chartable()
    return

  # FUNCTIONS
  openURL = (url) ->
    return window.open(url, '_blank').focus()
  # data
  downloadData = ()->
    dataDownloadQueue = []
    for one in indids
      if not RAW_DATA[one]
        download_event = $.getJSON "https://ocha.parseapp.com/getdata?indid=#{one}", (data)->
          # console.log data
          RAW_DATA[one] = data
        dataDownloadQueue.push download_event
    updatePeriods indids
    return
  updatePeriods = ()->
    clearRegions()
    period_selector.empty()
    $.when.apply($, dataDownloadQueue).done ()->
      periods = getPeriods()
      for period in periods
        $("<label class='checkbox-inline'><input type='checkbox' id='period_#{period}' value='#{period}'>#{period}</label>").appendTo period_selector
    return
  getPeriods = ()->
    updateState STATE_NONE
    result = []
    for indid in indids
      for one in RAW_DATA[indid]
        one_period = one['period']
        if one_period not in result
          result.push one_period
    result.sort()
  clearRegions = ()->
    region_selector.empty()
    resetMap()
    return $("<li class='expanded' data-children='0'><input type='checkbox'/>All Regions</li>").appendTo region_selector
  getRegions = ()->
    updateState STATE_NONE
    regions = {}
    for indid in indids
      for one in RAW_DATA[indid]
        one_period = one['period']
        one_value = parseFloat(one['value']).toFixed(1)
        one_region_code = one['region']
        one_region_name = one['region_name']
        one_admin1_code = one['admin1']
        one_admin1_name = one['admin1_name']
        one_admin2_code = one['admin2']
        one_admin2_name = one['admin2_name']
        if one_period in periods
          if not regions[one_region_code]
            regions[one_region_code] =
              name: one_region_name
              sub_regions: {}
          if one_admin1_code != 'NA' and not regions[one_region_code]['sub_regions'][one_admin1_code]
            regions[one_region_code]['sub_regions'][one_admin1_code] =
              name: one_admin1_name
              sub_regions: {}
          if one_admin2_code != 'NA' and not regions[one_region_code]['sub_regions'][one_admin1_code]['sub_regions'][one_admin2_code]
            regions[one_region_code]['sub_regions'][one_admin1_code]['sub_regions'][one_admin2_code] =
              name:one_admin2_name
              value: one_value
          else if one_admin1_code != 'NA'
            regions[one_region_code]['sub_regions'][one_admin1_code]['value'] = one_value
            # console.log regions[one_region_code]['sub_regions'][one_admin1_code]
          else
            regions[one_region_code]['value'] = one_value
    # console.log regions
    # create nav tree
    all_regions = clearRegions()
    all_regions_list_length = Object.keys(regions).length
    all_regions.attr('data-children', all_regions_list_length)
    if all_regions_list_length
      all_regions_list = $("<ol></ol>").appendTo all_regions
      for region_key in Object.keys(regions).sort()
        one_region_data = regions[region_key]
        one_region_element = $("<li><input type='checkbox' data-key='#{region_key}' data-path='#{region_key}' data-value='#{one_region_data['value']}'/>#{one_region_data['name']}</li>").appendTo all_regions_list
        all_admin1_list_length = Object.keys(one_region_data['sub_regions']).length
        if all_admin1_list_length
          all_admin1_list = $("<ol></ol>").appendTo $("<li data-children='#{all_admin1_list_length}'><input type='checkbox' data-key=''/>Subregions of #{one_region_data['name']}</li>").appendTo all_regions_list
          for admin1_key in Object.keys(one_region_data['sub_regions']).sort()
            one_admin1_data = one_region_data['sub_regions'][admin1_key]
            one_admin1_element = $("<li><input type='checkbox' data-key='#{admin1_key}' data-path='#{region_key}/#{admin1_key}' data-value='#{one_admin1_data['value']}'/>#{one_admin1_data['name']}</li>").appendTo all_admin1_list
            all_admin2_list_length = Object.keys(one_admin1_data['sub_regions']).length
            if all_admin2_list_length
              all_admin2_list = $("<ol></ol>").appendTo $("<li data-children='#{all_admin2_list_length}'><input type='checkbox' data-key=''/>Subregions of #{one_admin1_data['name']}</li>").appendTo all_admin1_list
              for admin2_key in Object.keys(one_admin1_data['sub_regions']).sort()
                one_admin2_data = one_admin1_data['sub_regions'][admin2_key]
                one_admin2_element = $("<li><input type='checkbox' data-key='#{admin2_key}' data-path='#{region_key}/#{admin1_key}/#{admin2_key}' data-value='#{one_admin2_data['value']}'/>#{one_admin2_data['name']}</li>").appendTo all_admin2_list
    createNavTree()
    return
  getValuesForPath = (path)->
    keys = path.split('/')
    the_region = ''
    the_admin1 = 'NA'
    the_admin2 = 'NA'
    if keys.length == 0
      console.log 'ERROR'
      return []
    else if keys.length == 1
      the_region = keys[0]
    else if keys.length == 2
      the_region = keys[0]
      the_admin1 = kyes[1]
    else if keys.length == 3
      the_region = keys[0]
      the_admin1 = kyes[1]
      the_admin2 = kyes[2]
    result = []
    for one_period in periods.sort()
      FOUND_VALUE = false
      for one_line in RAW_DATA[indids[0]]
        if one_line['region'] == the_region and one_line['admin1'] == the_admin1 and one_line['admin2'] == the_admin2 and one_line['period'] == one_period
          result.push one_line['value']
          FOUND_VALUE = true
          break
      if not FOUND_VALUE
        result.push null
    return result
  chartable = ()->
    indids_count = indids.length
    periods_count = periods.length
    regions_count = checked_regions.length
    if indids_count == 1
      if periods_count == 0
        updateState STATE_NONE
      else if periods_count == 1
        if regions_count == 0
          updateState STATE_NONE
        else if regions_count > 1
          updateState STATE_MAP
          $.when.apply($, mapDownloadQueue).done ()->
            for one in checked_regions.sort((a,b)->
                if a['path'] < b['path']
                  return -1
                if a['path'] > b['path']
                  return 1
                return 0
              )
              MAP_JSON['features'].push MAP_SHAPE_DATA[one['path']]
            displayMap()
        else
          updateState STATE_PIE
          createPieChart()
      else if periods_count > 1
        if regions_count == 0
          updateState STATE_NONE
        else if regions_count == 1
          updateState STATE_LINE
          createLineChart()
        else if regions_count > 1
          updateState STATE_MAP

    return

  # map
  getColor = (v) ->
    index = Math.floor(v / (100 / COLOR_LEVELS))
    color_map[index]
  getStyle = (feature) ->
    weight: 2
    opacity: 0.4
    color: '#000'
    fillOpacity: 1,
    fillColor: getColor(feature.properties.value)
  getLegendHTML = ()->
    labels = []
    label_range = 100 / COLOR_LEVELS
    for i in [0..COLOR_LEVELS-1] by 1
      from = i * label_range
      to = (i+1) * label_range
      labels.push "<li><span class='swatch' style='background:#{getColor(from)}'></span>#{from}-#{to}</li>"
    "<span>#{DATA_UNITS}</span><ul>#{labels.join('')}</ul"
  closeTooltip = window.setTimeout ()->
    map.closePopup()
  , 100
  highlightFeature = (e) ->
    layer = e.target
    feature = layer.feature
    countryID = layer.feature.id
    layer.setStyle
      weight: 4
      opacity: 1
      color: '#007ce0'
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
  addMapFeature = (path, v) ->
    file_path = "#{MAP_FILE_LINK}/#{path}.json"
    if MAP_SHAPE_DATA[path]
      one_feature = MAP_SHAPE_DATA[path]
      one_feature['properties']['value'] = v
      return null
    else
      return $.getJSON file_path, (map_json)->
        map_json['properties']['value'] = v
        MAP_SHAPE_DATA[path] = map_json
  resetMap = ()->
    if featureLayer
      featureLayer.clearLayers()
    if mapLegend
      map.legendControl.removeLegend mapLegend
      mapLegend = null
  displayMap = ()->
    resetMap()
    if not mapLegend
      mapLegend = getLegendHTML()
      map.legendControl.addLegend mapLegend
    if not featureLayer
      featureLayer = L.geoJson MAP_JSON,
        style: getStyle,
        onEachFeature: onEachFeature
      .addTo map
    else
      featureLayer.addData MAP_JSON
    window.setTimeout ()->
      map.fitBounds(featureLayer.getBounds());
    , 100
  return
