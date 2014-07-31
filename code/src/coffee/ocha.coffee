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
    $el = $(element).empty().addClass('pie')
    pie_width = $el.width()
    pie_data = []
    for one in data
      k = Object.keys(one)[0]
      v = one[k]
      pie_data.push [k,v]
    chart_config =
      bindto: element
      padding:
        top: 40
      color:
        pattern: chart_colors
      data:
        columns: pie_data
        type: 'pie'
    if pie_data.length == 1
      console.log '111'
      chart_config.data.columns.push ['Other', 100-pie_data[0][1]]
      chart_config.color.pattern = [chart_colors[0], 'eee']
    # console.log chart_config
    c3_chart = c3.generate chart_config
    svg = d3.select "#{element} svg"
    addTextToChart svg, title, 'chart-title', pie_width/2, 12
    addTextToChart svg, subtitle, 'chart-subtitle', pie_width/2, 30
    return c3_chart
