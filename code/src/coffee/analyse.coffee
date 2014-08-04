require ['js/ocha.js'], (ocha)->
  # FUNCTIONS
  mapDownloadQueue = []
  MAP_FILE_LINK = 'data/fao/country'
  MAP_FEATURES =
    "type": "FeatureCollection",
    "features": []
  REGION_TREE = [{
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
  getValuesByRegion = (data, regions)->
    result = {}
    for line in data
      region_path = [line.region,line.admin1,line.admin2].join('/').replace('/NA','')
      for one in regions
        if one == region_path
          result[one] = line.value
    return result
  downloadRegionMap = (key, value)->
    file_path = "#{MAP_FILE_LINK}/#{key}.json"
    download_event = $.getJSON file_path, (map_json)->
      map_json['properties']['path'] = key
      map_json['properties']['value'] = value
      MAP_FEATURES['features'].push map_json
    return download_event

  # $.getJSON 'https://ocha.parseapp.com/getdata?indid=CHD.B.WSH.02.T6', (data)->
  $.getJSON 'https://ocha.parseapp.com/getdata?indid=CHD.B.FOS.04.T6', (data)->
    data_fact = analyzeData data
    data_tree = generateTree data
    REGION_TREE[0]['children'] = data_tree
    ocha.createNavTree '#nav_tree', REGION_TREE, 'Select Country'
  ocha.createMapGraph 'map'
  return
