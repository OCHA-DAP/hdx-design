(function() {
  require(['js/ocha.js'], function(ocha) {
    var MAP_FEATURES, MAP_FILE_LINK, REGION_TREE, analyzeData, downloadRegionMap, filterDataByPeriod, generateTree, getValuesByRegion, mapDownloadQueue;
    mapDownloadQueue = [];
    MAP_FILE_LINK = 'data/fao/country';
    MAP_FEATURES = {
      "type": "FeatureCollection",
      "features": []
    };
    REGION_TREE = [
      {
        "name": "All Regions",
        "key": "all",
        "expanded": true,
        "class": "active",
        "children": []
      }
    ];
    analyzeData = function(data) {
      var one, result, values;
      values = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          one = data[_i];
          _results.push(one.value);
        }
        return _results;
      })();
      return result = {
        min: d3.min(values),
        max: d3.max(values),
        mean: d3.mean(values),
        median: d3.median(values)
      };
    };
    generateTree = function(data) {
      var admin1_pointer, children_dic, new_data, one, one_dic, path, path_array, path_depth, region_pointer, result, _i, _j, _len, _len1, _ref;
      new_data = {};
      result = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        one = data[_i];
        path = [one['region'], one['admin1'], one['admin2']].join('/').replace('/NA', '').replace('/NA', '');
        new_data[path] = one;
      }
      region_pointer;
      admin1_pointer;
      _ref = Object.keys(new_data).sort();
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        path = _ref[_j];
        one = new_data[path];
        one_dic = {
          'path': path
        };
        path_array = path.split('/');
        path_depth = path_array.length;
        if (path_depth === 1) {
          one_dic['name'] = one['region_name'];
          one_dic['key'] = one['region'];
          region_pointer = one_dic;
          result.push(one_dic);
        }
        if (path_depth === 2) {
          one_dic['name'] = one['admin1_name'];
          one_dic['key'] = one['admin1'];
          if (!region_pointer['children']) {
            children_dic = {
              'name': "States of " + region_pointer['name'],
              'children': []
            };
            region_pointer = children_dic;
            result.push(children_dic);
          }
          region_pointer['children'].push(one_dic);
          admin1_pointer = one_dic;
        }
        if (path_depth === 3) {
          one_dic['name'] = one['region_name'];
          one_dic['key'] = one['region'];
          if (!admin1_pointer['children']) {
            children_dic = {
              'name': "Cities of " + admin1_pointer['name'],
              'children': []
            };
            admin1_pointer = children_dic;
            region_pointer['children'].push(children_dic);
          }
          admin1_pointer['children'].push(one_dic);
        }
      }
      return result;
    };
    filterDataByPeriod = function(data, period) {
      var one, result, _i, _len;
      result = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        one = data[_i];
        if (one.period === period) {
          result.push(one);
        }
      }
      return result;
    };
    getValuesByRegion = function(data, regions) {
      var line, one, region_path, result, _i, _j, _len, _len1;
      result = {};
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        line = data[_i];
        region_path = [line.region, line.admin1, line.admin2].join('/').replace('/NA', '');
        for (_j = 0, _len1 = regions.length; _j < _len1; _j++) {
          one = regions[_j];
          if (one === region_path) {
            result[one] = line.value;
          }
        }
      }
      return result;
    };
    downloadRegionMap = function(key, value) {
      var download_event, file_path;
      file_path = "" + MAP_FILE_LINK + "/" + key + ".json";
      download_event = $.getJSON(file_path, function(map_json) {
        map_json['properties']['path'] = key;
        map_json['properties']['value'] = value;
        return MAP_FEATURES['features'].push(map_json);
      });
      return download_event;
    };
    $.getJSON('https://ocha.parseapp.com/getdata?indid=CHD.B.FOS.04.T6', function(data) {
      var data_fact, data_tree;
      data_fact = analyzeData(data);
      data_tree = generateTree(data);
      REGION_TREE[0]['children'] = data_tree;
      return ocha.createNavTree('#nav_tree', REGION_TREE, 'Select Country');
    });
    ocha.createMapGraph('map');
  });

}).call(this);
