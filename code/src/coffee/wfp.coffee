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

  # GLOBAL
  # data
  dataDownloadQueue = []
  RAW_DATA = {}
  DATA_UNITS = 'percent'
  SELECTED_PERIOD = null
  SELECTED_OPTION = null
  c3_chart = null
  DATA_STATE = null
  # map
  mapDownloadQueue = []
  mapID = 'yumiendo.j1majbom'#'yumiendo.ijchbik8''xyfeng.ijpo6lio'
  featureLayer = null
  mapLegend = null
  mapPeriods = $('#map_period_selector')
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
  # add full screen
  L.control.fullscreen().addTo(map);
  # hide all markers
  map.featureLayer.setFilter ->
    return false
  # popup layer
  popup = new L.Popup
    autoPan: false
  # map period selector event
  $(document).on 'click', '#map_period_selector .btn', (e)->
    $this = $(this)
    $this.addClass('active').siblings().removeClass('active')
    SELECTED_PERIOD = $this.text()
    updateMap()

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
  CURR_STATE = -1

  # build topics
  $.getJSON "data/topics.json", (data)->
    for k in Object.keys(data).sort()
      group = $("<optgroup label='#{k}'></optgroup>)").appendTo indicator_selector
      v = data[k]
      for one in v
        $("<option value='#{one.indid}'>#{one.name}</option>").appendTo group
    $('.chosen-select').chosen
      no_results_text: "Oops, nothing found!"
    return
  createNavTree = ()->
    $('#chosen_regions').bonsai
      checkboxes: true
    for one in $('#chosen_regions li[data-children]')
      one_count = $(one).data('children')
      $(one).find('>input').next().before "<span>#{one_count}</span>"
    return
  updateState = (new_state)->
    if CURR_STATE == new_state
      return false
    console.log "update state to #{new_state}"
    if new_state == STATE_NONE
      DATA_STATE = null
      map_container.hide()
      chart_container.hide()
    else if new_state == STATE_MAP
      map_container.show()
      chart_container.hide()
    else
      map_container.hide()
      chart_container.show()
    CURR_STATE = new_state
    return true

  # charts
  addTextToChart = (svg, text, text_class, x, y)->
    svg.append 'text'
      .attr 'transform', "translate(#{x}, #{y})"
      .attr 'class', text_class
      .attr 'text-anchor', 'middle'
      .text text
    return
  createSinglePieChart = ()->
    region_data = regions[checked_regions[0]]
    name = region_data['name']
    value = region_data['values'][0]['value']
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
  createSingleBarChart = ()->
    region_data = regions[checked_regions[0]]
    name = region_data['name']
    value = region_data['values'][0]['value']
    if c3_chart
      c3_chart.destroy()
    $('#chart').removeClass 'line'
    .removeClass 'pie'
    .addClass 'bar'
    chart_config =
      bindto: '#chart'
      padding:
        top: 30
        bottom: 20
      color:
        pattern: ['1ebfb3','eee']
      data:
        columns: [
          [name, value]
        ]
        type: 'bar'
      bar:
        width:
          ratio: 0.5
      axis:
        y:
          max: 100
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
  createBarChart = ()->
    chart_data_regions = []
    chart_data_values = [DATA_UNITS]
    for path in checked_regions
      region_data = regions[path]
      chart_data_values.push region_data['values'][0]['value']
      chart_data_regions.push region_data['name']
    if c3_chart
      c3_chart.destroy()
    $('#chart').removeClass 'line'
    .removeClass 'pie'
    .addClass 'bar'
    chart_config =
      bindto: '#chart'
      padding:
        top: 30
        bottom: 20
      color:
        pattern: ['1ebfb3','117be1', 'f2645a', '555555','ffd700']
      data:
        columns: [
          chart_data_values
        ]
        type: 'bar'
      bar:
        width:
          ratio: 0.5
      axis:
        x:
          type: 'category'
          categories: chart_data_regions
        y:
          max: 100
    c3_chart = c3.generate chart_config
    $('line.c3-xgrid-focus').hide();
    return
  createLineChart = ()->
    chart_data = {}
    chart_data['categories'] = periods.sort()
    chart_data['columns'] = []
    for one in checked_regions
      one_values = getValuesForPath one
      console.log one_values
      chart_data['columns'].push [regions[one]['name']].concat(one_values)
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
  unchecked_regions = []
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
    unchecked_regions = []
    for one in $('#chosen_regions input:checked')
      one_path = $(one).data('path')
      if one_path
        checked_regions.push one_path
    for one in $('#chosen_regions input:not(:checked)')
      one_path = $(one).data('path')
      if one_path
        unchecked_regions.push one_path
    # console.log checked_regions
    chartable()
    return
  # graph options
  $(document).on 'click', '#options_container span', ()->
    $this = $(this)
    $this.addClass('active').siblings().removeClass('active')
    op_text = $this.text()
    updateGraph(op_text)
  # FUNCTIONS
  openURL = (url) ->
    return window.open(url, '_blank').focus()
  # data
  downloadData = ()->
    dataDownloadQueue = []
    for one in indids
      if not RAW_DATA[one]
        console.log "https://ocha.parseapp.com/getdata?indid=#{one}"
        download_event = $.getJSON "https://ocha.parseapp.com/getdata?indid=#{one}", (data)->
          console.log data
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
    return $("<li class='expanded' data-children='0'><input type='checkbox'/>All Regions</li>").appendTo region_selector
  getRegions = ()->
    updateState STATE_NONE
    # create regions tree structure
    regions_tree = {}
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
          if not regions_tree[one_region_code]
            regions_tree[one_region_code] =
              name: one_region_name
              sub_regions: {}
              values: []
          if one_admin1_code != 'NA' and not regions_tree[one_region_code]['sub_regions'][one_admin1_code]
            regions_tree[one_region_code]['sub_regions'][one_admin1_code] =
              name: one_admin1_name
              sub_regions: {}
              values: []
          if one_admin2_code != 'NA'
            if not regions_tree[one_region_code]['sub_regions'][one_admin1_code]['sub_regions'][one_admin2_code]
              regions_tree[one_region_code]['sub_regions'][one_admin1_code]['sub_regions'][one_admin2_code] =
                name:one_admin2_name
                values:[{
                  period: one_period
                  value: one_value
                  }]
            else
              regions_tree[one_region_code]['sub_regions'][one_admin1_code]['sub_regions'][one_admin2_code]['values'].push
                period: one_period
                value: one_value
          else if one_admin1_code != 'NA'
            regions_tree[one_region_code]['sub_regions'][one_admin1_code]['values'].push
              period: one_period
              value: one_value
          else
            regions_tree[one_region_code]['values'].push
              period: one_period
              value: one_value
    # console.log regions_tree
    # create nav tree, start to download map shape json and form regions list
    regions = {}
    mapDownloadQueue = []
    all_regions = clearRegions()
    all_regions_list_length = Object.keys(regions_tree).length
    all_regions.attr('data-children', all_regions_list_length)
    if all_regions_list_length
      all_regions_list = $("<ol></ol>").appendTo all_regions
      for region_key in Object.keys(regions_tree).sort()
        one_region_data = regions_tree[region_key]
        one_region_element = $("<li><input type='checkbox' data-key='#{region_key}' data-path='#{region_key}'/>#{one_region_data['name']}</li>").appendTo all_regions_list
        map_download_event = addMapFeature region_key, one_region_data['name'], one_region_data['values']
        if map_download_event
          mapDownloadQueue.push map_download_event
        all_admin1_list_length = Object.keys(one_region_data['sub_regions']).length
        if all_admin1_list_length
          all_admin1_list = $("<ol></ol>").appendTo $("<li data-children='#{all_admin1_list_length}'><input type='checkbox' data-key=''/>Subregions of #{one_region_data['name']}</li>").appendTo all_regions_list
          for admin1_key in Object.keys(one_region_data['sub_regions']).sort()
            one_admin1_data = one_region_data['sub_regions'][admin1_key]
            one_admin1_element = $("<li><input type='checkbox' data-key='#{admin1_key}' data-path='#{region_key}/#{admin1_key}'/>#{one_admin1_data['name']}</li>").appendTo all_admin1_list
            map_download_event = addMapFeature "#{region_key}/#{admin1_key}", one_admin1_data['name'], one_admin1_data['values']
            if map_download_event
              mapDownloadQueue.push map_download_event
            all_admin2_list_length = Object.keys(one_admin1_data['sub_regions']).length
            if all_admin2_list_length
              all_admin2_list = $("<ol></ol>").appendTo $("<li data-children='#{all_admin2_list_length}'><input type='checkbox' data-key=''/>Subregions of #{one_admin1_data['name']}</li>").appendTo all_admin1_list
              for admin2_key in Object.keys(one_admin1_data['sub_regions']).sort()
                one_admin2_data = one_admin1_data['sub_regions'][admin2_key]
                one_admin2_element = $("<li><input type='checkbox' data-key='#{admin2_key}' data-path='#{region_key}/#{admin1_key}/#{admin2_key}'/>#{one_admin2_data['name']}</li>").appendTo all_admin2_list
                map_download_event = addMapFeature "##{region_key}/#{admin1_key}/#{admin2_key}", one_admin2_data['name'], one_admin2_data['values']
                if map_download_event
                  mapDownloadQueue.push map_download_event
    createNavTree()
    return
  getValuesForPath = (path)->
    values = regions[path]['values']
    result = []
    for one_period in periods.sort()
      VALUE_FOUND = false
      for one in values
        if one['period'] == one_period
          VALUE_FOUND = true
          result.push one['value']
          break
      if not VALUE_FOUND
        result.push null
    return result
  showOptions = (ops)->
    $graph_options = $('#options_container').empty()
    FIRST_OP = true
    for op in ops
      op_u = op.toUpperCase()
      op_l = op.toLowerCase()
      if FIRST_OP
        $("<span class='graph_option active #{op_l}'>#{op_u}<span>").appendTo $graph_options
        FIRST_OP = false
      else
        $("<span class='graph_option #{op_l}'>#{op_u}<span>").appendTo $graph_options
    return
  updateGraph = (op)->
    if op == 'B'
      SELECTED_OPTION = op
      updateState STATE_BAR
      if DATA_STATE == '111'
        createSingleBarChart()
      else
        createBarChart()
    if op == 'M'
      SELECTED_OPTION = op
      updateState STATE_MAP
      createMap()
  chartable = ()->
    console.log 'start chartable'
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
          if DATA_STATE != '11M'
            DATA_STATE = '11M'
            updateState(STATE_MAP)
            createMap()
            showOptions ['M','P','B','L']
          else
            updateGraph SELECTED_OPTION
        else
          DATA_STATE = '111'
          updateState STATE_PIE
          createSinglePieChart()
          showOptions ['P','B']
      else if periods_count > 1
        if regions_count == 0
          updateState STATE_NONE
        else if regions_count == 1
          DATA_STATE = '1M1'
          updateState STATE_LINE
          createLineChart()
        else if regions_count > 1
          DATA_STATE = '1MM'
          updateState(STATE_MAP)
          createMap()
    return

  # map
  getColor = (v) ->
    index = Math.floor(v / (100 / COLOR_LEVELS))
    color_map[index]
  getFeatureValue = (feature)->
    for one in feature.properties.values
      if one['period'] == SELECTED_PERIOD
        return one['value']
    return null
  getStyleByValue = (value)->
    weight: 2
    opacity: 0.4
    color: '#000'
    fillOpacity: 1,
    fillColor: getColor(value)
  getStyle = (feature) ->
    value = getFeatureValue feature
    if feature.properties.path in checked_regions and value
      return getStyleByValue value
    return {
      opacity: 0
      fillOpacity: 0
    }
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
    value = getFeatureValue feature
    if feature.properties.path not in checked_regions or not value
      # layer.disable()
      return false
    # layer.eable()
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
    <div class='marker-number'>#{value}</div>
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
  addMapFeature = (path, name, v) ->
    sorted_v = v.sort((a,b)->
        if a.period > b.period
          return 1
        if a.period < b.period
          return -1
        return 0
      )
    regions[path] =
      name: name
      values: sorted_v
    file_path = "#{MAP_FILE_LINK}/#{path}.json"
    if MAP_SHAPE_DATA[path]
      one_feature = MAP_SHAPE_DATA[path]
      one_feature['properties']['values'] = sorted_v
      return null
    else
      return $.getJSON file_path, (map_json)->
        map_json['properties']['path'] = path
        map_json['properties']['values'] = sorted_v
        MAP_SHAPE_DATA[path] = map_json
  createMap = ()->
    console.log 'create new map'
    # add period selection button
    mapPeriods.empty()
    FIRST_BUTTON = true
    for one_period in periods
      if FIRST_BUTTON
        $("<button type='button' class='btn btn-info active'>#{one_period}</button>").appendTo mapPeriods
        SELECTED_PERIOD = one_period
        FIRST_BUTTON = false
      else
        $("<button type='button' class='btn btn-info'>#{one_period}</button>").appendTo mapPeriods

    # after download finished, assembled to a map json
    $.when.apply($, mapDownloadQueue).done ()->
      MAP_JSON['features'] = []
      for one_path in checked_regions.sort()
        MAP_JSON['features'].push MAP_SHAPE_DATA[one_path]
      # add legend
      if mapLegend
        map.legendControl.removeLegend mapLegend
      mapLegend = getLegendHTML()
      map.legendControl.addLegend mapLegend
      updateMap()
    return
  updateMap = ()->
    # add features
    if featureLayer
      map.removeLayer featureLayer
    featureLayer = L.geoJson MAP_JSON,
      style: getStyle,
      onEachFeature: onEachFeature
    .addTo map
    # zoom to fit
    window.setTimeout ()->
      map.fitBounds(featureLayer.getBounds());
    , 100
  return
