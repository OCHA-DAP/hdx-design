(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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

  require(['jquery', 'bootstrap', 'mapbox', 'leaflet_omnivore', 'leaflet_fullscreen', 'd3', 'c3', 'chroma', 'chosen', 'bonsai', 'qubit'], function($, b, m, o, f, d3, c3, chroma) {
    var COLOR_LEVELS, CURR_STATE, DATA_UNITS, MAP_FILE_LINK, MAP_JSON, MAP_SHAPE_DATA, RAW_DATA, SELECTED_PERIOD, STATE_BAR, STATE_LINE, STATE_MAP, STATE_NONE, STATE_PIE, STATE_RADAR, STATE_SCATTER, addMapFeature, addTextToChart, c3_chart, chart_container, chartable, checked_regions, clearRegions, closeTooltip, color_map, color_scale, createLineChart, createMap, createNavTree, createPieChart, dataDownloadQueue, downloadData, featureClicked, featureLayer, getColor, getFeatureValue, getLegendHTML, getPeriods, getRegions, getStyle, getStyleByValue, getValuesForPath, highlightFeature, i, indicator_selector, indids, map, mapDownloadQueue, mapID, mapLegend, mapPeriods, map_container, onEachFeature, openURL, period_selector, periods, popup, region_selector, regions, resetFeature, topLayer, topPane, unchecked_regions, updateMap, updatePeriods, updateState, _i;
    $(document).on('click', '.group-result', function() {
      var $this, unselected;
      $this = $(this);
      unselected = $this.nextUntil('.group-result').not('.result-selected');
      if (unselected.length) {
        return unselected.trigger('mouseup');
      } else {
        return $this.nextUntil('.group-result').each(function() {
          return $("a.search-choice-close[data-option-array-index='" + ($this.data('option-array-index')) + "']").trigger('click');
        });
      }
    });
    $('.chosen-select').chosen({
      no_results_text: "Oops, nothing found!"
    });
    dataDownloadQueue = [];
    RAW_DATA = {};
    DATA_UNITS = 'percent';
    SELECTED_PERIOD = null;
    c3_chart = null;
    mapDownloadQueue = [];
    mapID = 'yumiendo.j1majbom';
    featureLayer = null;
    mapLegend = null;
    mapPeriods = $('#map_period_selector');
    MAP_SHAPE_DATA = {};
    MAP_JSON = {
      "type": "FeatureCollection",
      "features": []
    };
    MAP_FILE_LINK = 'data/fao/country';
    map = L.mapbox.map('map', mapID, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 10,
      tileLayer: {
        continuousWorld: false,
        noWrap: false
      }
    });
    map.scrollWheelZoom.disable();
    L.control.fullscreen().addTo(map);
    map.featureLayer.setFilter(function() {
      return false;
    });
    popup = new L.Popup({
      autoPan: false
    });
    $(document).on('click', '#map_period_selector .btn', function(e) {
      var $this;
      $this = $(this);
      $this.addClass('active').siblings().removeClass('active');
      SELECTED_PERIOD = $this.text();
      return updateMap();
    });
    topPane = map._createPane('leaflet-top-pane', map.getPanes().mapPane);
    topLayer = L.mapbox.tileLayer(mapID);
    topLayer.addTo(map);
    topPane.appendChild(topLayer.getContainer());
    topLayer.setZIndex(7);
    COLOR_LEVELS = 5;
    color_scale = chroma.scale(['#fcbba1', '#67000d']).mode('hsl').correctLightness(true).out('hex');
    color_map = [];
    for (i = _i = 0; _i <= COLOR_LEVELS; i = _i += 1) {
      color_map.push(color_scale(i / parseFloat(COLOR_LEVELS)));
    }
    indicator_selector = $('#chosen_indicators');
    period_selector = $('#chosen_periods');
    region_selector = $('#chosen_regions');
    map_container = $('#map_container');
    chart_container = $('#chart_container');
    STATE_NONE = 0;
    STATE_BAR = 1;
    STATE_LINE = 2;
    STATE_MAP = 3;
    STATE_PIE = 4;
    STATE_RADAR = 5;
    STATE_SCATTER = 6;
    CURR_STATE = STATE_NONE;
    createNavTree = function() {
      var one, one_count, _j, _len, _ref;
      $('#chosen_regions').bonsai({
        checkboxes: true
      });
      _ref = $('#chosen_regions li[data-children]');
      for (_j = 0, _len = _ref.length; _j < _len; _j++) {
        one = _ref[_j];
        one_count = $(one).data('children');
        $(one).find('>input').next().before("<span>" + one_count + "</span>");
      }
    };
    updateState = function(new_state) {
      if (CURR_STATE === new_state) {
        return false;
      }
      console.log("update state to " + new_state);
      if (new_state === STATE_NONE) {
        map_container.hide();
        chart_container.hide();
      } else if (new_state === STATE_MAP) {
        map_container.show();
        chart_container.hide();
      } else {
        map_container.hide();
        chart_container.show();
      }
      CURR_STATE = new_state;
      return true;
    };
    addTextToChart = function(svg, text, text_class, x, y) {
      svg.append('text').attr('transform', "translate(" + x + ", " + y + ")").attr('class', text_class).attr('text-anchor', 'middle').text(text);
    };
    createPieChart = function() {
      var chart_config, name, region_data, svg, value;
      region_data = regions[checked_regions[0]];
      name = region_data['name'];
      value = region_data['values'][0]['value'];
      if (c3_chart) {
        c3_chart.destroy();
      }
      $('#chart').removeClass('line').removeClass('bar').addClass('pie');
      chart_config = {
        bindto: '#chart',
        padding: {
          top: 30,
          bottom: 20
        },
        color: {
          pattern: ['1ebfb3', 'eee']
        },
        data: {
          columns: [[name, value], ['others', 100 - value]],
          type: 'pie'
        },
        legend: {
          show: false
        },
        tooltip: {
          show: false
        }
      };
      c3_chart = c3.generate(chart_config);
      svg = d3.select("#chart svg");
      addTextToChart(svg, name, 'chart-title', 380, 20);
      addTextToChart(svg, value, 'chart-value', 380, 305);
      addTextToChart(svg, DATA_UNITS, 'chart-unit', 380, 315);
    };
    createLineChart = function() {
      var chart_config, chart_data, one, one_values, _j, _len;
      chart_data = {};
      chart_data['categories'] = periods.sort();
      chart_data['columns'] = [];
      for (_j = 0, _len = checked_regions.length; _j < _len; _j++) {
        one = checked_regions[_j];
        one_values = getValuesForPath(one);
        console.log(one_values);
        chart_data['columns'].push([regions[one]['name']].concat(one_values));
      }
      if (c3_chart) {
        c3_chart.destroy();
      }
      $('#chart').removeClass('pie').removeClass('bar').addClass('line');
      chart_config = {
        bindto: '#chart',
        padding: {
          top: 30,
          bottom: 20,
          padding: 60
        },
        data: {
          columns: chart_data['columns'],
          type: 'line'
        },
        axis: {
          x: {
            type: 'category',
            categories: chart_data['categories']
          }
        }
      };
      c3_chart = c3.generate(chart_config);
    };
    updateState(STATE_NONE);
    indids = [];
    periods = [];
    regions = {};
    checked_regions = [];
    unchecked_regions = [];
    indicator_selector.change(function() {
      indids = $(this).val();
      if (!indids) {
        indids = [];
      }
      downloadData();
    });
    $(document).on('click', '#chosen_periods .checkbox-inline input', function() {
      var one, _j, _len, _ref;
      periods = [];
      _ref = $('#chosen_periods .checkbox-inline input:checked');
      for (_j = 0, _len = _ref.length; _j < _len; _j++) {
        one = _ref[_j];
        periods.push(one.value);
      }
      getRegions();
    });
    createNavTree();
    $(document).on('click', '#chosen_regions input', function() {
      var one, one_path, _j, _k, _len, _len1, _ref, _ref1;
      checked_regions = [];
      unchecked_regions = [];
      _ref = $('#chosen_regions input:checked');
      for (_j = 0, _len = _ref.length; _j < _len; _j++) {
        one = _ref[_j];
        one_path = $(one).data('path');
        if (one_path) {
          checked_regions.push(one_path);
        }
      }
      _ref1 = $('#chosen_regions input:not(:checked)');
      for (_k = 0, _len1 = _ref1.length; _k < _len1; _k++) {
        one = _ref1[_k];
        one_path = $(one).data('path');
        if (one_path) {
          unchecked_regions.push(one_path);
        }
      }
      chartable();
    });
    openURL = function(url) {
      return window.open(url, '_blank').focus();
    };
    downloadData = function() {
      var download_event, one, _j, _len;
      dataDownloadQueue = [];
      for (_j = 0, _len = indids.length; _j < _len; _j++) {
        one = indids[_j];
        if (!RAW_DATA[one]) {
          download_event = $.getJSON("https://ocha.parseapp.com/getdata?indid=" + one, function(data) {
            return RAW_DATA[one] = data;
          });
          dataDownloadQueue.push(download_event);
        }
      }
      updatePeriods(indids);
    };
    updatePeriods = function() {
      clearRegions();
      period_selector.empty();
      $.when.apply($, dataDownloadQueue).done(function() {
        var period, _j, _len, _results;
        periods = getPeriods();
        _results = [];
        for (_j = 0, _len = periods.length; _j < _len; _j++) {
          period = periods[_j];
          _results.push($("<label class='checkbox-inline'><input type='checkbox' id='period_" + period + "' value='" + period + "'>" + period + "</label>").appendTo(period_selector));
        }
        return _results;
      });
    };
    getPeriods = function() {
      var indid, one, one_period, result, _j, _k, _len, _len1, _ref;
      updateState(STATE_NONE);
      result = [];
      for (_j = 0, _len = indids.length; _j < _len; _j++) {
        indid = indids[_j];
        _ref = RAW_DATA[indid];
        for (_k = 0, _len1 = _ref.length; _k < _len1; _k++) {
          one = _ref[_k];
          one_period = one['period'];
          if (__indexOf.call(result, one_period) < 0) {
            result.push(one_period);
          }
        }
      }
      return result.sort();
    };
    clearRegions = function() {
      region_selector.empty();
      return $("<li class='expanded' data-children='0'><input type='checkbox'/>All Regions</li>").appendTo(region_selector);
    };
    getRegions = function() {
      var admin1_key, admin2_key, all_admin1_list, all_admin1_list_length, all_admin2_list, all_admin2_list_length, all_regions, all_regions_list, all_regions_list_length, indid, map_download_event, one, one_admin1_code, one_admin1_data, one_admin1_element, one_admin1_name, one_admin2_code, one_admin2_data, one_admin2_element, one_admin2_name, one_period, one_region_code, one_region_data, one_region_element, one_region_name, one_value, region_key, regions_tree, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _n, _ref, _ref1, _ref2, _ref3;
      updateState(STATE_NONE);
      regions_tree = {};
      for (_j = 0, _len = indids.length; _j < _len; _j++) {
        indid = indids[_j];
        _ref = RAW_DATA[indid];
        for (_k = 0, _len1 = _ref.length; _k < _len1; _k++) {
          one = _ref[_k];
          one_period = one['period'];
          one_value = parseFloat(one['value']).toFixed(1);
          one_region_code = one['region'];
          one_region_name = one['region_name'];
          one_admin1_code = one['admin1'];
          one_admin1_name = one['admin1_name'];
          one_admin2_code = one['admin2'];
          one_admin2_name = one['admin2_name'];
          if (__indexOf.call(periods, one_period) >= 0) {
            if (!regions_tree[one_region_code]) {
              regions_tree[one_region_code] = {
                name: one_region_name,
                sub_regions: {},
                values: []
              };
            }
            if (one_admin1_code !== 'NA' && !regions_tree[one_region_code]['sub_regions'][one_admin1_code]) {
              regions_tree[one_region_code]['sub_regions'][one_admin1_code] = {
                name: one_admin1_name,
                sub_regions: {},
                values: []
              };
            }
            if (one_admin2_code !== 'NA') {
              if (!regions_tree[one_region_code]['sub_regions'][one_admin1_code]['sub_regions'][one_admin2_code]) {
                regions_tree[one_region_code]['sub_regions'][one_admin1_code]['sub_regions'][one_admin2_code] = {
                  name: one_admin2_name,
                  values: [
                    {
                      period: one_period,
                      value: one_value
                    }
                  ]
                };
              } else {
                regions_tree[one_region_code]['sub_regions'][one_admin1_code]['sub_regions'][one_admin2_code]['values'].push({
                  period: one_period,
                  value: one_value
                });
              }
            } else if (one_admin1_code !== 'NA') {
              regions_tree[one_region_code]['sub_regions'][one_admin1_code]['values'].push({
                period: one_period,
                value: one_value
              });
            } else {
              regions_tree[one_region_code]['values'].push({
                period: one_period,
                value: one_value
              });
            }
          }
        }
      }
      regions = {};
      mapDownloadQueue = [];
      all_regions = clearRegions();
      all_regions_list_length = Object.keys(regions_tree).length;
      all_regions.attr('data-children', all_regions_list_length);
      if (all_regions_list_length) {
        all_regions_list = $("<ol></ol>").appendTo(all_regions);
        _ref1 = Object.keys(regions_tree).sort();
        for (_l = 0, _len2 = _ref1.length; _l < _len2; _l++) {
          region_key = _ref1[_l];
          one_region_data = regions_tree[region_key];
          one_region_element = $("<li><input type='checkbox' data-key='" + region_key + "' data-path='" + region_key + "'/>" + one_region_data['name'] + "</li>").appendTo(all_regions_list);
          map_download_event = addMapFeature(region_key, one_region_data['name'], one_region_data['values']);
          if (map_download_event) {
            mapDownloadQueue.push(map_download_event);
          }
          all_admin1_list_length = Object.keys(one_region_data['sub_regions']).length;
          if (all_admin1_list_length) {
            all_admin1_list = $("<ol></ol>").appendTo($("<li data-children='" + all_admin1_list_length + "'><input type='checkbox' data-key=''/>Subregions of " + one_region_data['name'] + "</li>").appendTo(all_regions_list));
            _ref2 = Object.keys(one_region_data['sub_regions']).sort();
            for (_m = 0, _len3 = _ref2.length; _m < _len3; _m++) {
              admin1_key = _ref2[_m];
              one_admin1_data = one_region_data['sub_regions'][admin1_key];
              one_admin1_element = $("<li><input type='checkbox' data-key='" + admin1_key + "' data-path='" + region_key + "/" + admin1_key + "'/>" + one_admin1_data['name'] + "</li>").appendTo(all_admin1_list);
              map_download_event = addMapFeature("" + region_key + "/" + admin1_key, one_admin1_data['name'], one_admin1_data['values']);
              if (map_download_event) {
                mapDownloadQueue.push(map_download_event);
              }
              all_admin2_list_length = Object.keys(one_admin1_data['sub_regions']).length;
              if (all_admin2_list_length) {
                all_admin2_list = $("<ol></ol>").appendTo($("<li data-children='" + all_admin2_list_length + "'><input type='checkbox' data-key=''/>Subregions of " + one_admin1_data['name'] + "</li>").appendTo(all_admin1_list));
                _ref3 = Object.keys(one_admin1_data['sub_regions']).sort();
                for (_n = 0, _len4 = _ref3.length; _n < _len4; _n++) {
                  admin2_key = _ref3[_n];
                  one_admin2_data = one_admin1_data['sub_regions'][admin2_key];
                  one_admin2_element = $("<li><input type='checkbox' data-key='" + admin2_key + "' data-path='" + region_key + "/" + admin1_key + "/" + admin2_key + "'/>" + one_admin2_data['name'] + "</li>").appendTo(all_admin2_list);
                  map_download_event = addMapFeature("#" + region_key + "/" + admin1_key + "/" + admin2_key, one_admin2_data['name'], one_admin2_data['values']);
                  if (map_download_event) {
                    mapDownloadQueue.push(map_download_event);
                  }
                }
              }
            }
          }
        }
      }
      createNavTree();
    };
    getValuesForPath = function(path) {
      var VALUE_FOUND, one, one_period, result, values, _j, _k, _len, _len1, _ref;
      values = regions[path]['values'];
      result = [];
      _ref = periods.sort();
      for (_j = 0, _len = _ref.length; _j < _len; _j++) {
        one_period = _ref[_j];
        VALUE_FOUND = false;
        for (_k = 0, _len1 = values.length; _k < _len1; _k++) {
          one = values[_k];
          if (one['period'] === one_period) {
            VALUE_FOUND = true;
            result.push(one['value']);
            break;
          }
        }
        if (!VALUE_FOUND) {
          result.push(null);
        }
      }
      return result;
    };
    chartable = function() {
      var indids_count, periods_count, regions_count;
      console.log('start chartable');
      indids_count = indids.length;
      periods_count = periods.length;
      regions_count = checked_regions.length;
      if (indids_count === 1) {
        if (periods_count === 0) {
          updateState(STATE_NONE);
        } else if (periods_count === 1) {
          if (regions_count === 0) {
            updateState(STATE_NONE);
          } else if (regions_count > 1) {
            updateState(STATE_MAP);
            createMap();
          } else {
            updateState(STATE_PIE);
            createPieChart();
          }
        } else if (periods_count > 1) {
          if (regions_count === 0) {
            updateState(STATE_NONE);
          } else if (regions_count === 1) {
            updateState(STATE_LINE);
            createLineChart();
          } else if (regions_count > 1) {
            updateState(STATE_MAP);
            createMap();
          }
        }
      }
    };
    getColor = function(v) {
      var index;
      index = Math.floor(v / (100 / COLOR_LEVELS));
      return color_map[index];
    };
    getFeatureValue = function(feature) {
      var one, _j, _len, _ref;
      _ref = feature.properties.values;
      for (_j = 0, _len = _ref.length; _j < _len; _j++) {
        one = _ref[_j];
        if (one['period'] === SELECTED_PERIOD) {
          return one['value'];
        }
      }
      return null;
    };
    getStyleByValue = function(value) {
      return {
        weight: 2,
        opacity: 0.4,
        color: '#000',
        fillOpacity: 1,
        fillColor: getColor(value)
      };
    };
    getStyle = function(feature) {
      var value, _ref;
      value = getFeatureValue(feature);
      if ((_ref = feature.properties.path, __indexOf.call(checked_regions, _ref) >= 0) && value) {
        return getStyleByValue(value);
      }
      return {
        opacity: 0,
        fillOpacity: 0
      };
    };
    getLegendHTML = function() {
      var from, label_range, labels, to, _j, _ref;
      labels = [];
      label_range = 100 / COLOR_LEVELS;
      for (i = _j = 0, _ref = COLOR_LEVELS - 1; _j <= _ref; i = _j += 1) {
        from = i * label_range;
        to = (i + 1) * label_range;
        labels.push("<li><span class='swatch' style='background:" + (getColor(from)) + "'></span>" + from + "-" + to + "</li>");
      }
      return "<span>" + DATA_UNITS + "</span><ul>" + (labels.join('')) + "</ul";
    };
    closeTooltip = window.setTimeout(function() {
      return map.closePopup();
    }, 100);
    highlightFeature = function(e) {
      var countryID, feature, feature_name, layer, value, _ref;
      layer = e.target;
      feature = layer.feature;
      value = getFeatureValue(feature);
      if ((_ref = feature.properties.path, __indexOf.call(checked_regions, _ref) < 0) || !value) {
        return false;
      }
      countryID = layer.feature.id;
      layer.setStyle({
        weight: 4,
        opacity: 1,
        color: '#007ce0'
      });
      feature_name = feature.properties.ADM0_NAME;
      if (feature.properties.ADM1_NAME) {
        feature_name = feature.properties.ADM1_NAME;
        if (feature.properties.ADM2_NAME) {
          feature_name = feature.properties.ADM2_NAME;
        }
      }
      popup.setLatLng(e.latlng);
      popup.setContent("<div class='marker-container'> <div class='marker-number'>" + value + "</div> <div class='marker-label'>" + feature_name + "</div> </div>");
      if (!popup._map) {
        popup.openOn(map);
      }
      window.clearTimeout(closeTooltip);
    };
    resetFeature = function(e) {
      var layer, layer_style;
      layer = e.target;
      layer_style = getStyle(layer.feature);
      layer.setStyle(layer_style);
      closeTooltip = window.setTimeout(function() {
        return map.closePopup();
      }, 100);
    };
    featureClicked = function(e) {
      var code, layer;
      layer = e.target;
      code = layer.feature.id.toLowerCase();
      openURL("country.html?code=" + code);
    };
    onEachFeature = function(feature, layer) {
      layer.on({
        mousemove: highlightFeature,
        mouseout: resetFeature,
        click: featureClicked
      });
    };
    addMapFeature = function(path, name, v) {
      var file_path, one_feature, sorted_v;
      sorted_v = v.sort(function(a, b) {
        if (a.period > b.period) {
          return 1;
        }
        if (a.period < b.period) {
          return -1;
        }
        return 0;
      });
      regions[path] = {
        name: name,
        values: sorted_v
      };
      file_path = "" + MAP_FILE_LINK + "/" + path + ".json";
      if (MAP_SHAPE_DATA[path]) {
        one_feature = MAP_SHAPE_DATA[path];
        one_feature['properties']['values'] = sorted_v;
        return null;
      } else {
        return $.getJSON(file_path, function(map_json) {
          map_json['properties']['path'] = path;
          map_json['properties']['values'] = sorted_v;
          return MAP_SHAPE_DATA[path] = map_json;
        });
      }
    };
    createMap = function() {
      var FIRST_BUTTON, one_period, _j, _len;
      console.log('create new map');
      mapPeriods.empty();
      FIRST_BUTTON = true;
      for (_j = 0, _len = periods.length; _j < _len; _j++) {
        one_period = periods[_j];
        if (FIRST_BUTTON) {
          $("<button type='button' class='btn btn-info active'>" + one_period + "</button>").appendTo(mapPeriods);
          SELECTED_PERIOD = one_period;
          FIRST_BUTTON = false;
        } else {
          $("<button type='button' class='btn btn-info'>" + one_period + "</button>").appendTo(mapPeriods);
        }
      }
      $.when.apply($, mapDownloadQueue).done(function() {
        var one_path, _k, _len1, _ref;
        MAP_JSON['features'] = [];
        _ref = checked_regions.sort();
        for (_k = 0, _len1 = _ref.length; _k < _len1; _k++) {
          one_path = _ref[_k];
          MAP_JSON['features'].push(MAP_SHAPE_DATA[one_path]);
        }
        if (mapLegend) {
          map.legendControl.removeLegend(mapLegend);
        }
        mapLegend = getLegendHTML();
        map.legendControl.addLegend(mapLegend);
        return updateMap();
      });
    };
    updateMap = function() {
      if (featureLayer) {
        map.removeLayer(featureLayer);
      }
      featureLayer = L.geoJson(MAP_JSON, {
        style: getStyle,
        onEachFeature: onEachFeature
      }).addTo(map);
      return window.setTimeout(function() {
        return map.fitBounds(featureLayer.getBounds());
      }, 100);
    };
  });

}).call(this);
