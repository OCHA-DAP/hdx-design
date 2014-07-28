(function() {
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
      chosen: 'lib/chosen.v1.1.min'
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
      }
    }
  });

  require(['jquery', 'bootstrap', 'mapbox', 'leaflet_omnivore', 'leaflet_fullscreen', 'd3', 'c3', 'chroma', 'chosen'], function($, b, m, o, f, d3, c3, chroma) {
    var COLOR_LEVELS, FILE_LINK, MAP_JSON, MAP_SHAPE_DATA, MAP_UNITS, addMapFeature, closeTooltip, color_map, color_scale, featureClicked, getColor, getLegendHTML, getStyle, highlightFeature, i, indicator_selector, indid_str, jsonQueue, map, mapID, onEachFeature, openURL, period_str, peroid_selector, popup, region_selector, resetFeature, topLayer, topPane, _i;
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
    indicator_selector = $('#chosen_indicators');
    peroid_selector = $('#chosen_peroids');
    region_selector = $('#chosen_regions');
    indid_str = '';
    indicator_selector.change(function() {
      var indids;
      indids = $(this).val();
      if (indids) {
        indid_str = indids.join(',');
        return $.getJSON("https://ocha.parseapp.com/getwfpperiods?indid=" + indid_str, function(data) {
          var group_selector, one, _i, _len;
          console.log(data);
          peroid_selector.empty();
          group_selector = $("<optgroup label='All'></optgroup>").appendTo(peroid_selector);
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            one = data[_i];
            $("<option value='" + one + "'>" + one + "</option>").appendTo(group_selector);
          }
          return peroid_selector.trigger("chosen:updated");
        });
      } else {
        indid_str = '';
        peroid_selector.empty();
        return peroid_selector.trigger("chosen:updated");
      }
    });
    period_str = '';
    peroid_selector.change(function() {
      var jsonQueue, periods;
      periods = $(this).val();
      if (periods) {
        period_str = periods.join(',');
        jsonQueue = [];
        return $.getJSON("https://ocha.parseapp.com/getwfpdata?period=" + period_str + "&indid=" + indid_str, function(data) {
          var MAP_UNITS, ad1_k, ad1_v, admin1_code, admin1_name, admin2_code, admin2_name, download_event, one, one_value, r_k, r_v, region_code, region_group_selector, region_name, regions_select_list, _i, _len, _ref;
          console.log("https://ocha.parseapp.com/getwfpdata?period=" + period_str + "&indid=" + indid_str);
          region_selector.empty();
          regions_select_list = {};
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            one = data[_i];
            MAP_UNITS = one['units'];
            region_code = one['region'];
            region_name = one['region_name'];
            admin1_code = one['admin1'];
            admin1_name = one['admin1_name'];
            admin2_code = one['admin2'];
            admin2_name = one['admin2_name'];
            one_value = parseFloat(one['value']).toFixed(1);
            download_event = addMapFeature(region_code, admin1_code, admin2_code, one_value);
            if (download_event) {
              jsonQueue.push(download_event);
            }
            if (!regions_select_list[region_code]) {
              regions_select_list[region_code] = {
                name: region_name,
                sub_regions: {}
              };
            }
            if (admin1_code !== 'NA') {
              regions_select_list[region_code]['sub_regions'][admin1_code] = {
                name: admin1_name,
                sub_regions: {}
              };
            }
            if (admin2_code !== 'NA') {
              regions_select_list[region_code]['sub_regions'][admin1_code]['sub_regions'][admin2_code] = {
                name: admin2_name
              };
            }
          }
          for (r_k in regions_select_list) {
            r_v = regions_select_list[r_k];
            if (Object.keys(r_v['sub_regions']).length) {
              region_group_selector = $("<optgroup label='" + r_v['name'] + "'></optgroup>").appendTo(region_selector);
              _ref = r_v['sub_regions'];
              for (ad1_k in _ref) {
                ad1_v = _ref[ad1_k];
                $("<option value='" + ad1_k + "'>" + ad1_v['name'] + "</option>").appendTo(region_group_selector);
              }
            } else {
              $("<option value='" + r_k + "'>" + r_v['name'] + "</option>").appendTo(region_selector);
            }
          }
          return region_selector.trigger("chosen:updated");
        });
      }
    });
    region_selector.change(function() {
      var regions;
      regions = $(this).val();
      if (regions) {
        MAP_JSON['features'] = [];
        return $.when.apply($, jsonQueue).done(function() {
          var one, _i, _len;
          for (_i = 0, _len = regions.length; _i < _len; _i++) {
            one = regions[_i];
            MAP_JSON['features'].push(MAP_SHAPE_DATA[one]);
          }
          return console.log(MAP_JSON);
        });
      }
    });
    $('#run').on('click', function() {
      var countryLayer;
      map.legendControl.addLegend(getLegendHTML());
      countryLayer = L.geoJson(MAP_JSON, {
        style: getStyle,
        onEachFeature: onEachFeature
      });
      countryLayer.addTo(map);
      return map.fitBounds(countryLayer.getBounds());
    });
    jsonQueue = [];
    MAP_SHAPE_DATA = {};
    MAP_JSON = {
      "type": "FeatureCollection",
      "features": []
    };
    mapID = 'yumiendo.j1majbom';
    MAP_UNITS = 'percent';
    COLOR_LEVELS = 5;
    color_scale = chroma.scale(['#fcbba1', '#67000d']).mode('hsl').correctLightness(true).out('hex');
    color_map = [];
    for (i = _i = 0; _i <= COLOR_LEVELS; i = _i += 1) {
      color_map.push(color_scale(i / parseFloat(COLOR_LEVELS)));
    }
    console.log(color_map);
    openURL = function(url) {
      return window.open(url, '_blank').focus();
    };
    getColor = function(v) {
      var index;
      index = Math.floor(v / (100 / COLOR_LEVELS));
      return color_map[index];
    };
    getStyle = function(feature) {
      return {
        weight: 0,
        fillOpacity: 1,
        fillColor: getColor(feature.properties.value)
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
      return "<span>" + MAP_UNITS + "</span><ul>" + (labels.join('')) + "</ul";
    };
    closeTooltip = window.setTimeout(function() {
      return map.closePopup();
    }, 100);
    highlightFeature = function(e) {
      var countryID, feature, feature_name, layer;
      layer = e.target;
      feature = layer.feature;
      countryID = layer.feature.id;
      layer.setStyle({
        weigth: 1,
        opacity: 0.2,
        color: '#ccc',
        fillOpacity: 1.0,
        fillColor: '#000'
      });
      feature_name = feature.properties.ADM0_NAME;
      if (feature.properties.ADM1_NAME) {
        feature_name = feature.properties.ADM1_NAME;
        if (feature.properties.ADM2_NAME) {
          feature_name = feature.properties.ADM2_NAME;
        }
      }
      popup.setLatLng(e.latlng);
      popup.setContent("<div class='marker-container'> <div class='marker-number'>" + feature.properties.value + "</div> <div class='marker-label'>" + feature_name + "</div> </div>");
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
    FILE_LINK = 'data/fao/country';
    addMapFeature = function(r, ad1, ad2, v) {
      var file_key, file_path, one_feature;
      file_key = r;
      file_path = "" + FILE_LINK + "/" + r + ".json";
      if (ad2 !== 'NA') {
        file_key = ad2;
        file_path = "" + FILE_LINK + "/" + r + "/" + ad1 + "/" + ad2 + ".json";
      } else if (ad1 !== 'NA') {
        file_key = ad1;
        file_path = "" + FILE_LINK + "/" + r + "/" + ad1 + ".json";
      }
      if (MAP_SHAPE_DATA[file_key]) {
        one_feature = MAP_SHAPE_DATA[file_key];
        one_feature['properties']['value'] = v;
        return null;
      } else {
        return $.getJSON(file_path, function(map_json) {
          map_json['properties']['value'] = v;
          return MAP_SHAPE_DATA[file_key] = map_json;
        });
      }
    };
    map = L.mapbox.map('map', mapID, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 8,
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
    topPane = map._createPane('leaflet-top-pane', map.getPanes().mapPane);
    topLayer = L.mapbox.tileLayer(mapID);
    topLayer.addTo(map);
    topPane.appendChild(topLayer.getContainer());
    topLayer.setZIndex(7);
  });

}).call(this);
