require ['js/ocha.js'], (ocha)->
  # FUNCTIONS
  window.AlL_DATA = null
  window.DATA_FACT = {}
  window.mapDownloadQueue = []
  window.MAP_FILE_LINK = 'data/fao/country'
  window.MAP_LOCAL_STORAGE = {}
  window.MAP_FEATURES =
    "type": "FeatureCollection",
    "features": []
  window.REGION_TREE = [{
    "name": "All Regions"
    "key": "all"
    "expanded": true
    "class": "active"
    "children": []}]
  # data
  analyzeData = (data)->
    values = (one.value for one in data)
    result =
      min: d3.min(values)
      max: d3.max(values)
      mean: d3.mean(values)
      median: d3.median(values)
      units: data[0]['units']
      units_text: data[0]['units_text']
  generateTree = (data)->
    new_data = {}
    result = []
    for one in data
      path = [one['region'], one['admin1'], one['admin2']].join('/').replace('/NA','').replace('/NA','')
      new_data[path] = one
    region_pointer
    admin1_pointer
    for path in Object.keys(new_data).sort()
      one = new_data[path]
      one_dic =
        'path': path
      path_array = path.split('/')
      path_depth = path_array.length
      if path_depth == 1
        one_dic['name'] = one['region_name']
        one_dic['key'] = one['region']
        region_pointer = one_dic
        result.push one_dic
      if path_depth == 2
        one_dic['name'] = one['admin1_name']
        one_dic['key'] = one['admin1']
        if not region_pointer['children']
          children_dic =
            'name': "States of #{region_pointer['name']}"
            'children': []
          region_pointer = children_dic
          result.push children_dic
        region_pointer['children'].push one_dic
        admin1_pointer = one_dic
      if path_depth == 3
        one_dic['name'] = one['region_name']
        one_dic['key'] = one['region']
        if not admin1_pointer['children']
          children_dic =
            'name': "Cities of #{admin1_pointer['name']}"
            'children': []
          admin1_pointer = children_dic
          region_pointer['children'].push children_dic
        admin1_pointer['children'].push one_dic
      # console.log path
    return result
  filterDataByPeriod = (data, period)->
    result = []
    for one in data
      if one.period == period
        result.push one
    return result
  getPeriodsUnionByRegion = (data, regions)->
    result = []
    # get periods union
    for line in data
      region_path = [line.region,line.admin1,line.admin2].join('/').replace('/NA','').replace('/NA','')
      for one in regions
        if one == region_path and line.period not in result
          result.push line.period
    return result
  getPeriodsIntersectionByRegion = (data, regions)->
    dict = {}
    # get periods intersection
    for line in data
      region_path = [line.region,line.admin1,line.admin2].join('/').replace('/NA','').replace('/NA','')
      for one in regions
        if one == region_path
          if not dict[one]
            dict[one] = [line.period]
          else
            dict[one].push line.period
    all_arrays = []
    for k,v of dict
      all_arrays.push v
    if regions.length == 0
      return []
    else if regions.length == 1
      return all_arrays[0]
    all_arrays.sort (a,b)->
      a.length - b.length
    result = all_arrays.shift().filter (v)->
      return all_arrays.every (a)->
        return a.indexOf(v) != -1
    return result
  getValuesByPeriodAndRegion = (period, data, regions)->
    result = {}
    for line in data
      region_path = [line.region,line.admin1,line.admin2].join('/').replace('/NA','').replace('/NA','')
      for one in regions
        if one == region_path and line.period == period
          result[one] = line.value
    return result
  downloadRegionMap = (key, value)->
    file_path = "#{window.MAP_FILE_LINK}/#{key}.json"
    if window.MAP_LOCAL_STORAGE[key]
      window.MAP_LOCAL_STORAGE[key]['properties']['path'] = key
      window.MAP_LOCAL_STORAGE[key]['properties']['value'] = value
      window.MAP_FEATURES['features'].push window.MAP_LOCAL_STORAGE[key]
      return null
    try
      download_event = $.getJSON file_path, (map_json)->
        map_json['properties']['path'] = key
        map_json['properties']['value'] = value
        window.MAP_LOCAL_STORAGE[key] = map_json
        window.MAP_FEATURES['features'].push map_json
      return download_event
    catch err
      console.log err
    return null
  updateGraphByRegions = (regions)->
    periods = getPeriodsIntersectionByRegion window.AlL_DATA, regions
    console.log periods
    if periods.length > 0
      data = getValuesByPeriodAndRegion periods[0], window.AlL_DATA, regions
      console.log data
    else
      data = []
    window.MAP_FEATURES['features'] = []
    for k,v of data
      map_download_event = downloadRegionMap k, v
      window.mapDownloadQueue.push map_download_event
    $.when.apply($, window.mapDownloadQueue).done ()->
      # console.log window.MAP_FEATURES
      ocha.addDataToMap map_graph, window.MAP_FEATURES, window.DATA_FACT.min, window.DATA_FACT.max, window.DATA_FACT.units_text
    return

  $.getJSON 'https://ocha.parseapp.com/getdata?indid=CHD.B.WSH.02.T6', (data)->
  # $.getJSON 'https://ocha.parseapp.com/getdata?indid=CHD.B.FOS.04.T6', (data)->
    window.AlL_DATA = data.slice(0)
    window.DATA_FACT = analyzeData data
    $('#min_num').html window.DATA_FACT.min.toFixed(1)
    $('#mean_num').html window.DATA_FACT.mean.toFixed(1)
    $('#median_num').html window.DATA_FACT.median.toFixed(1)
    $('#max_num').html window.DATA_FACT.max.toFixed(1)
    data_tree = generateTree data
    window.REGION_TREE[0]['children'] = data_tree
    ocha.createNavTree '#nav_tree', window.REGION_TREE, 'Select Country'

  # create map
  map_graph = ocha.createMapGraph 'map'

  # period_selector = ocha.createSlider '#period_selector', ['1991', '1992', '1993', '1994']

  $(document).on 'click','#region_selection input',()->
    checked_regions = []
    for one in $('#region_selection input:checked')
      one_path = $(one).data('path')
      if one_path
        checked_regions.push one_path
    updateGraphByRegions(checked_regions)
    return
  return
