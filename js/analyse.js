(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  require(['js/ocha.js'], function(ocha) {
    var analyzeData, downloadRegionMap, filterDataByPeriod, generateTree, getPeriodsIntersectionByRegion, getPeriodsUnionByRegion, getValuesByPeriodAndRegion, map_graph, updateGraphByRegions;
    window.AlL_DATA = null;
    window.DATA_FACT = {};
    window.mapDownloadQueue = [];
    window.MAP_FILE_LINK = 'data/fao/country';
    window.MAP_LOCAL_STORAGE = {};
    window.MAP_FEATURES = {
      "type": "FeatureCollection",
      "features": []
    };
    window.REGION_TREE = [
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
        median: d3.median(values),
        units: data[0]['units'],
        units_text: data[0]['units_text']
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
    getPeriodsUnionByRegion = function(data, regions) {
      var line, one, region_path, result, _i, _j, _len, _len1, _ref;
      result = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        line = data[_i];
        region_path = [line.region, line.admin1, line.admin2].join('/').replace('/NA', '').replace('/NA', '');
        for (_j = 0, _len1 = regions.length; _j < _len1; _j++) {
          one = regions[_j];
          if (one === region_path && (_ref = line.period, __indexOf.call(result, _ref) < 0)) {
            result.push(line.period);
          }
        }
      }
      return result;
    };
    getPeriodsIntersectionByRegion = function(data, regions) {
      var all_arrays, dict, k, line, one, region_path, result, v, _i, _j, _len, _len1;
      dict = {};
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        line = data[_i];
        region_path = [line.region, line.admin1, line.admin2].join('/').replace('/NA', '').replace('/NA', '');
        for (_j = 0, _len1 = regions.length; _j < _len1; _j++) {
          one = regions[_j];
          if (one === region_path) {
            if (!dict[one]) {
              dict[one] = [line.period];
            } else {
              dict[one].push(line.period);
            }
          }
        }
      }
      all_arrays = [];
      for (k in dict) {
        v = dict[k];
        all_arrays.push(v);
      }
      if (regions.length === 0) {
        return [];
      } else if (regions.length === 1) {
        return all_arrays[0];
      }
      all_arrays.sort(function(a, b) {
        return a.length - b.length;
      });
      result = all_arrays.shift().filter(function(v) {
        return all_arrays.every(function(a) {
          return a.indexOf(v) !== -1;
        });
      });
      return result;
    };
    getValuesByPeriodAndRegion = function(period, data, regions) {
      var line, one, region_path, result, _i, _j, _len, _len1;
      result = {};
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        line = data[_i];
        region_path = [line.region, line.admin1, line.admin2].join('/').replace('/NA', '').replace('/NA', '');
        for (_j = 0, _len1 = regions.length; _j < _len1; _j++) {
          one = regions[_j];
          if (one === region_path && line.period === period) {
            result[one] = line.value;
          }
        }
      }
      return result;
    };
    downloadRegionMap = function(key, value) {
      var download_event, err, file_path;
      file_path = "" + window.MAP_FILE_LINK + "/" + key + ".json";
      if (window.MAP_LOCAL_STORAGE[key]) {
        window.MAP_LOCAL_STORAGE[key]['properties']['path'] = key;
        window.MAP_LOCAL_STORAGE[key]['properties']['value'] = value;
        window.MAP_FEATURES['features'].push(window.MAP_LOCAL_STORAGE[key]);
        return null;
      }
      try {
        download_event = $.getJSON(file_path, function(map_json) {
          map_json['properties']['path'] = key;
          map_json['properties']['value'] = value;
          window.MAP_LOCAL_STORAGE[key] = map_json;
          return window.MAP_FEATURES['features'].push(map_json);
        });
        return download_event;
      } catch (_error) {
        err = _error;
        console.log(err);
      }
      return null;
    };
    updateGraphByRegions = function(regions) {
      var data, k, map_download_event, periods, v;
      periods = getPeriodsIntersectionByRegion(window.AlL_DATA, regions);
      console.log(periods);
      if (periods.length > 0) {
        data = getValuesByPeriodAndRegion(periods[0], window.AlL_DATA, regions);
        console.log(data);
      } else {
        data = [];
      }
      window.MAP_FEATURES['features'] = [];
      for (k in data) {
        v = data[k];
        map_download_event = downloadRegionMap(k, v);
        window.mapDownloadQueue.push(map_download_event);
      }
      $.when.apply($, window.mapDownloadQueue).done(function() {
        return ocha.addDataToMap(map_graph, window.MAP_FEATURES, window.DATA_FACT.min, window.DATA_FACT.max, window.DATA_FACT.units_text);
      });
    };
    $.getJSON('https://ocha.parseapp.com/getdata?indid=CHD.B.WSH.02.T6', function(data) {
      var data_tree;
      window.AlL_DATA = data.slice(0);
      window.DATA_FACT = analyzeData(data);
      $('#min_num').html(window.DATA_FACT.min.toFixed(1));
      $('#mean_num').html(window.DATA_FACT.mean.toFixed(1));
      $('#median_num').html(window.DATA_FACT.median.toFixed(1));
      $('#max_num').html(window.DATA_FACT.max.toFixed(1));
      data_tree = generateTree(data);
      window.REGION_TREE[0]['children'] = data_tree;
      return ocha.createNavTree('#nav_tree', window.REGION_TREE, 'Select Country');
    });
    map_graph = ocha.createMapGraph('map');
    $(document).on('click', '#region_selection input', function() {
      var checked_regions, one, one_path, _i, _len, _ref;
      checked_regions = [];
      _ref = $('#region_selection input:checked');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        one = _ref[_i];
        one_path = $(one).data('path');
        if (one_path) {
          checked_regions.push(one_path);
        }
      }
      updateGraphByRegions(checked_regions);
    });
  });

}).call(this);
