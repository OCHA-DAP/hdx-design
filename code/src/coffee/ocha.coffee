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
      bootstrap_combobox: 'lib/bootstrap-combobox',
      bonsai: 'lib/tree/jquery.bonsai',
      qubit: 'lib/tree/jquery.qubit',
      typeahead: 'lib/typeahead.jquery',
      radarchart: 'lib/radarchart'
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
    'bootstrap-combobox': {
      deps: ['bootstrap']
    }
    'qubit': {
      deps: ['jquery']
    },
    'bonsai': {
      deps: ['jquery', 'qubit']
    },
    'typeahead': {
      deps: ['jquery']
    },
    'radarchart': {
      deps: ['d3']
    }
  }
});
define ['jquery',
'bootstrap',
'mapbox',
'leaflet_omnivore',
'leaflet_fullscreen',
'd3',
'c3',
'chroma',
'chosen',
'bootstrap_combobox',
'bonsai',
'qubit',
'typeahead',
'radarchart'
], ($, b, m, o, f, d3, c3, chroma)->
  # Globals
  CHART_COLORS = ['1ebfb3','117be1', 'f2645a', '555555','ffd700']
  CHART_CATS_MAX = 30
  MAP_ID = 'yumiendo.j1majbom'
  MAP_COLOR_LEVELS = 5
  # colors
  MAP_COLORS = []
  MAP_COLORS_SCALE = chroma.scale(['#fcbba1','#67000d']).mode('hsl').correctLightness(true).out('hex')
  for i in [0..MAP_COLOR_LEVELS] by 1
    MAP_COLORS.push MAP_COLORS_SCALE(i / parseFloat(MAP_COLOR_LEVELS))
  # FUNCTIONS
  substringMatcher = (strs) ->
    findMatches = (q, cb) ->
      matches = undefined
      substrRegex = undefined

      # an array that will be populated with substring matches
      matches = []

      # regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(q, "i")

      # iterate through the pool of strings and for any string that
      # contains the substring `q`, add it to the `matches` array
      $.each strs, (i, str) ->

        # the typeahead jQuery plugin expects suggestions to a
        # JavaScript object, refer to typeahead docs for more info
        matches.push value: str  if substrRegex.test(str)
        return

      cb matches
      return
  createList = ($el, data)->
    $ol = $("<ol></ol>").appendTo $el
    for one in data
      expand_attr = ""
      attributes = ""
      children_count_label = ""
      keys = Object.keys(one)
      for k in keys
        if k != 'name' and k != 'children' and k != 'class' and k != 'expanded'
          attributes = "#{attributes}data-#{k}='#{one[k]}' "
        if k == 'expanded' and one[k]
          expand_attr = "class='expanded'"
        if k == 'children' and one[k].length
          children_count_label = "<span>[#{one[k].length}]</span>"
      $li = $("<li #{expand_attr}><input type='checkbox' class='#{one.class or ' '}' #{attributes}data-name='#{one.name}'><label>#{one.name}</label>#{children_count_label}</li>").appendTo $ol
      if children_count_label != ''
        createList $li, one.children
    return
  fetchValues = (array, data, key)->
    for one in data
      array.push one[key]
      if one.children and one.children.length
        fetchValues array, one.children, key
  addTextToChart = (svg, text, text_class, x, y)->
    svg.append 'text'
      .attr 'transform', "translate(#{x}, #{y})"
      .attr 'class', text_class
      .attr 'text-anchor', 'middle'
      .text text
    return

  addChartTitles = (svg, title, subtitle, chart_width)->
    addTextToChart svg, title, 'chart-title', chart_width/2, 12
    addTextToChart svg, subtitle, 'chart-subtitle', chart_width/2, 30
    return
  categoriesData = (data)->
    result = {cats:[],data:[]}
    for key, count in Object.keys(data).sort()
      if count == CHART_CATS_MAX
        break
      result.cats.push key
      if result.data.length == 0
        for one in data[key]
          k = Object.keys(one)[0]
          v = one[k]
          result.data.push [k, v]
      else
        for one, i in data[key]
          k = Object.keys(one)[0]
          v = one[k]
          result.data[i].push v
    return result

  getColor = (v, range) ->
    index = Math.floor(v / (range / MAP_COLOR_LEVELS))
    # console.log v
    MAP_COLORS[index]

  # COMPONENTS
  createNavTree: (element, data, placeholder)->
    $el = $(element).addClass('nav-tree')
    # create search head
    $searchbar = $("<div class='search-input-group input-dropdown'><input type='text' class='typeahead' placeholder='#{placeholder}'><div class='input-group-btn'></div></div>").appendTo $el
    regions = []
    fetchValues regions, data, 'name'
    # console.log regions
    $searchbar.children().first().typeahead {
        hint: true
        highlight: true
        minLength: 1
      },
      {
        name: 'regions'
        source: substringMatcher regions
      },
    .on 'typeahead:selected', (event, item)->
      $(this).val ""
      region = item.value
      $label = $("#{element} .tree-container >ol input[data-name='#{region}']").next()
      offest = $label.offset().top - $("#{element} .tree-container >ol").offset().top
      $("#{element} .tree-container").scrollTop(offest);
      $label.addClass('flash').delay(1200).queue ()->
        $(this).removeClass('flash').dequeue()
    .on 'mousedown', ()->
      $(this).val ""

    # create select options
    $("<div class='tree-options'><a class='select-all'>Select all</a><span>|</span><a class='clear-all'>Clear all</a></div>").appendTo $el
    # create tree checkboxes
    $tree_container = $("<div class='tree-container'></div>").appendTo $el
    $(document).on 'click', "#{element} .tree-options a.select-all", ()->
      $("#{element} .tree-container >ol input").prop('checked', true)
    $(document).on 'click', "#{element} .tree-options a.clear-all", ()->
      $("#{element} .tree-container >ol input").prop('checked', false)
    createList $tree_container, data
    $("#{element} .tree-container >ol").bonsai
      expandAll: true
      checkboxes: true
    return

  createDropdown: (data, placeholder)->
    $result = $("<div class='input-dropdown'><input type='text' class='typeahead' placeholder='#{placeholder}'><button class='btn'><span class='caret'></span></span></button></div>")
    # $result.children().first().typeahead {
    #   hint: true
    #   highlight: true
    #   minLength: 1
    # },
    # {
    #   source: substringMatcher data
    # }
    return $result

  # data = [{k:v},{k:v}...]
  createPieChart: (element, title, subtitle, data)->
    $el = $(element).empty().removeClass().addClass('pie chart')
    chart_width = $el.width()
    chart_data = []
    for one in data
      k = Object.keys(one)[0]
      v = one[k]
      chart_data.push [k,v]
    chart_config =
      bindto: element
      padding:
        top: 40
      color:
        pattern: CHART_COLORS
      data:
        columns: chart_data
        type: 'pie'
    if chart_data.length == 1
      chart_config.data.columns.push ['Other', 100-chart_data[0][1]]
      chart_config.color.pattern = [CHART_COLORS[0], 'eee']
    # console.log chart_config
    c3_chart = c3.generate chart_config
    svg = d3.select "#{element} svg"
    addChartTitles svg, title, subtitle, chart_width
    return c3_chart

  # data = { cat_key: [{name: value},{name:value}], cat_key:...]}
  createLineChart: (element, title, subtitle, data, units)->
    $el = $(element).empty().removeClass().addClass('line chart')
    chart_width = $el.width()
    chart_data = categoriesData data
    # console.log chart_data
    chart_config =
      bindto: element
      padding:
        top: 40
      color:
        pattern: CHART_COLORS
      data:
        columns: chart_data.data
        type: 'area'
      axis:
        x:
          type: 'category'
          categories: chart_data.cats
        y:
          label:
            text: units
            position: 'outer-middle'
          tick:
            format:
              d3.format(',')
      grid:
        y:
          show: true
    c3_chart = c3.generate chart_config
    svg = d3.select "#{element} svg"
    addChartTitles svg, title, subtitle, chart_width
    return

  createBarChart: (element, title, subtitle, data, units)->
    $el = $(element).empty().removeClass().addClass('bar chart')
    chart_width = $el.width()
    chart_data = categoriesData data
    # console.log chart_data
    chart_config =
      bindto: element
      padding:
        top: 40
      color:
        pattern: CHART_COLORS
      data:
        columns: chart_data.data
        type: 'bar'
      axis:
        x:
          type: 'category'
          categories: chart_data.cats
        y:
          label:
            text: units
            position: 'outer-middle'
          tick:
            format:
              d3.format(',')
      grid:
        y:
          show: true
    c3_chart = c3.generate chart_config
    svg = d3.select "#{element} svg"
    addChartTitles svg, title, subtitle, chart_width
    $('.c3.bar line.c3-xgrid-focus').hide();
    return

  createScatterPlotChart: (element, title, subtitle, data, unit1, unit2)->
    $el = $(element).empty().removeClass().addClass('scatter chart')
    chart_width = $el.width()
    chart_data = {'keys':{}, 'labels':[], 'data':[]}
    for cat_key, cat_value of data
      # get keys
      chart_data.keys[cat_key] = "#{cat_key}_x"
      indid_keys = Object.keys(cat_value)
      if indid_keys.length != 2
        console.log 'ERROR, only take 2 indicators'
        return
      # get labels
      if chart_data.labels.length == 0
        chart_data.labels.push "#{indid_keys[0]} [by #{unit1}]"
        chart_data.labels.push "#{indid_keys[1]} [by #{unit2}]"
      chart_data.data.push ["#{cat_key}_x"].concat cat_value[indid_keys[0]]
      chart_data.data.push ["#{cat_key}"].concat cat_value[indid_keys[1]]
    # console.log chart_data
    chart_config =
      bindto: element
      padding:
        top: 40
      color:
        pattern: CHART_COLORS
      data:
        xs: chart_data.keys
        columns: chart_data.data
        type: 'scatter'
      axis:
        x:
          label:
            text:chart_data.labels[0]
            position: 'outer-right'
          tick:
            format:
              d3.format(',')
        y:
          label:
            text:chart_data.labels[1]
            position: 'outer-middle'
          tick:
            format:
              d3.format(',')
    c3_chart = c3.generate chart_config
    svg = d3.select "#{element} svg"
    addChartTitles svg, title, subtitle, chart_width
    return

  createRadarChart: (element, title, subtitle, data, unit)->
    $el = $(element).empty().removeClass().addClass('radar chart')
    chart_width = $el.width()
    chart_height = $el.height()
    # console.log chart_data
    chart_config =
      w: chart_width-120
      h: chart_height-140
      ExtraWidthX:120
      ExtraWidthY:140
      TranslateX:60
      TranslateY:75
      radius: 3
      opacityArea: 0.7
      color: (i)->
        CHART_COLORS[i%CHART_COLORS.length]
    radar_chart = RadarChart.draw element, data, chart_config
    svg = d3.select "#{element} svg"
    addChartTitles svg, title, subtitle, chart_width
    return radar_chart

  createMapGraph: (element)->
    map = L.mapbox.map element, MAP_ID,
      center: [20, 0]
      zoom: 2
      minZoom: 2
      maxZoom: 10
      tileLayer:
        continuousWorld: false
        noWrap: false
    map.scrollWheelZoom.disable()
    # add full screen
    # L.control.fullscreen().addTo(map)
    # hide all markers
    map.featureLayer.setFilter ->
      return false
    # popup layer
    map.ochaPopup = new L.Popup
      autoPan: false
    # map pop up close timer
    map.ochaPopupCloseTimer = window.setTimeout ()->
      map.closePopup()
    , 100
    # re-order layers
    topPane = map._createPane 'leaflet-top-pane', map.getPanes().mapPane
    topLayer = L.mapbox.tileLayer MAP_ID
    topLayer.addTo map
    topPane.appendChild topLayer.getContainer()
    topLayer.setZIndex 7
    return map
  addDataToMap: (map, data, min, max, unit)->
    # add legend
    if map.ochaLegend
      map.legendControl.removeLegend map.ochaLegend
    legendLabels = []
    legendRange = max - min
    for i in [0..(MAP_COLOR_LEVELS - 1)]
      legendFrom = min + i * legendRange / MAP_COLOR_LEVELS
      legendTo = min + (i+1) * legendRange /MAP_COLOR_LEVELS
      legendLabels.push "<li><span class='swatch' style='background:#{getColor(legendFrom, legendRange)}'></span>#{legendFrom.toFixed(1)} - #{legendTo.toFixed(1)}</li>"
    map.ochaLegend = "<span>#{unit}</span><ul>#{legendLabels.join('')}</ul"
    map.legendControl.addLegend map.ochaLegend
    if map.ochaLayer
      map.removeLayer map.ochaLayer
      map.ochaLayer = null
    map.ochaLayer = L.geoJson data,
      style: (feature) ->
        weight: 2
        opacity: 0.4
        color: '#000'
        fillOpacity: 1,
        fillColor: getColor(feature.properties.value, legendRange)
      onEachFeature: (feature, layer) ->
        layer.on
          mousemove: (e) ->
            layer = e.target
            layer.setStyle
              weight: 4
              opacity: 1
              color: '#007ce0'
            feature = layer.feature
            # console.log feature
            # tooltip
            feature_name = feature.properties.ADM0_NAME
            if feature.properties.ADM1_NAME
              feature_name = feature.properties.ADM1_NAME
              if feature.properties.ADM2_NAME
                feature_name = feature.properties.ADM2_NAME
            map.ochaPopup.setLatLng e.latlng
            map.ochaPopup.setContent "
            <div class='marker-container'>
            <div class='marker-number'>#{feature.properties.value}</div>
              <div class='marker-label'>#{feature_name}</div>
            </div>
            "
            if !map.ochaPopup._map
              !map.ochaPopup.openOn map
            window.clearTimeout map.ochaPopupCloseTimer
            return
          mouseout: (e) ->
            layer = e.target
            layer.setStyle
              weight: 2
              opacity: 0.4
              color: '#000'
              fillOpacity: 1,
              fillColor: getColor(feature.properties.value, legendRange)
            map.ochaPopupCloseTimer = window.setTimeout ()->
              map.closePopup()
            , 100
            return
    .addTo map
    # zoom to fit
    window.setTimeout ()->
      map.fitBounds(map.ochaLayer.getBounds());
    , 300
    return
