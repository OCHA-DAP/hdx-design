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
      qubit: 'lib/tree/jquery.qubit',
      typeahead: 'lib/typeahead.jquery'
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
    },
    'typeahead': {
      deps: ['jquery']
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
'bonsai',
'qubit',
'typeahead'
], ($, b, m, o, f, d3, c3, chroma)->
  # Globals
  chart_colors = ['1ebfb3','117be1', 'f2645a', '555555','ffd700']
  CHART_CATS_MAX = 30
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

  # COMPONENTS
  createNavTree: (element, data, placeholder)->
    $el = $(element).addClass('nav-tree')
    # create search head
    $searchbar = $("<div class='search-input-group input-dropdown'><input type='text' class='typeahead' placeholder='#{placeholder}'><div class='input-group-btn'></div></div>").appendTo $el
    regions = []
    fetchValues regions, data, 'name'
    # console.log regions
    $searchbar.children().first().typeahead null,
      name: 'regions'
      source: substringMatcher regions
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
    $result = $("<div class='input-dropdown'><input type='text' class='typeahead' placeholder='#{placeholder}'></div>")
    $result.children().first().typeahead null,
      source: substringMatcher data
    return $result

  # data = [{k:v},{k:v}...]
  createPieChart: (element, title, subtitle, data)->
    $el = $(element).empty().removeClass().addClass('pie')
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
        pattern: chart_colors
      data:
        columns: chart_data
        type: 'pie'
    if chart_data.length == 1
      chart_config.data.columns.push ['Other', 100-chart_data[0][1]]
      chart_config.color.pattern = [chart_colors[0], 'eee']
    # console.log chart_config
    c3_chart = c3.generate chart_config
    svg = d3.select "#{element} svg"
    addChartTitles svg, title, subtitle, chart_width
    return c3_chart

  # data = { cat_key: [{name: value},{name:value}], cat_key:...]}
  createLineChart: (element, title, subtitle, data, units)->
    $el = $(element).empty().removeClass().addClass('line')
    chart_width = $el.width()
    chart_data = categoriesData data
    # console.log chart_data
    chart_config =
      bindto: element
      padding:
        top: 40
      color:
        pattern: chart_colors
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
    $el = $(element).empty().removeClass().addClass('bar')
    chart_width = $el.width()
    chart_data = categoriesData data
    # console.log chart_data
    chart_config =
      bindto: element
      padding:
        top: 40
      color:
        pattern: chart_colors
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
    return

  createScatterPlotChart: (element, title, subtitle, data, unit1, unit2)->
    $el = $(element).empty().removeClass().addClass('scatter')
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
        pattern: chart_colors
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
