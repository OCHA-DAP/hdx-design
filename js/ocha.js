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
      chosen: 'lib/chosen.v1.1.min',
      bootstrap_combobox: 'lib/bootstrap-combobox',
      bonsai: 'lib/tree/jquery.bonsai',
      qubit: 'lib/tree/jquery.qubit',
      typeahead: 'lib/typeahead.jquery',
      radarchart: 'lib/radarchart',
      uislider: 'lib/nouislider.v6.2.0.min'
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
      },
      'radarchart': {
        deps: ['d3']
      },
      'uislider': {
        deps: ['jquery']
      }
    }
  });

  define(['jquery', 'bootstrap', 'mapbox', 'leaflet_omnivore', 'leaflet_fullscreen', 'd3', 'c3', 'chroma', 'chosen', 'bootstrap_combobox', 'bonsai', 'qubit', 'typeahead', 'radarchart', 'uislider'], function($, b, m, o, f, d3, c3, chroma) {
    var CHART_CATS_MAX, CHART_COLORS, MAP_COLORS, MAP_COLORS_SCALE, MAP_COLOR_LEVELS, MAP_ID, addChartTitles, addTextToChart, categoriesData, createList, fetchValues, getColor, i, substringMatcher, _i;
    CHART_COLORS = ['1ebfb3', '117be1', 'f2645a', '555555', 'ffd700'];
    CHART_CATS_MAX = 30;
    MAP_ID = 'yumiendo.j1majbom';
    MAP_COLOR_LEVELS = 5;
    MAP_COLORS = [];
    MAP_COLORS_SCALE = chroma.scale(['#fcbba1', '#67000d']).mode('hsl').correctLightness(true).out('hex');
    for (i = _i = 0; _i <= MAP_COLOR_LEVELS; i = _i += 1) {
      MAP_COLORS.push(MAP_COLORS_SCALE(i / parseFloat(MAP_COLOR_LEVELS)));
    }
    substringMatcher = function(strs) {
      var findMatches;
      return findMatches = function(q, cb) {
        var matches, substrRegex;
        matches = void 0;
        substrRegex = void 0;
        matches = [];
        substrRegex = new RegExp(q, "i");
        $.each(strs, function(i, str) {
          if (substrRegex.test(str)) {
            matches.push({
              value: str
            });
          }
        });
        cb(matches);
      };
    };
    createList = function($el, data) {
      var $li, $ol, attributes, children_count_label, expand_attr, k, keys, one, _j, _k, _len, _len1;
      $ol = $("<ol></ol>").appendTo($el);
      for (_j = 0, _len = data.length; _j < _len; _j++) {
        one = data[_j];
        expand_attr = "";
        attributes = "";
        children_count_label = "";
        keys = Object.keys(one);
        for (_k = 0, _len1 = keys.length; _k < _len1; _k++) {
          k = keys[_k];
          if (k !== 'name' && k !== 'children' && k !== 'class' && k !== 'expanded') {
            attributes = "" + attributes + "data-" + k + "='" + one[k] + "' ";
          }
          if (k === 'expanded' && one[k]) {
            expand_attr = "class='expanded'";
          }
          if (k === 'children' && one[k].length) {
            children_count_label = "<span>[" + one[k].length + "]</span>";
          }
        }
        $li = $("<li " + expand_attr + "><input type='checkbox' class='" + (one["class"] || ' ') + "' " + attributes + "data-name='" + one.name + "'><label>" + one.name + "</label>" + children_count_label + "</li>").appendTo($ol);
        if (children_count_label !== '') {
          createList($li, one.children);
        }
      }
    };
    fetchValues = function(array, data, key) {
      var one, _j, _len, _results;
      _results = [];
      for (_j = 0, _len = data.length; _j < _len; _j++) {
        one = data[_j];
        array.push(one[key]);
        if (one.children && one.children.length) {
          _results.push(fetchValues(array, one.children, key));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    addTextToChart = function(svg, text, text_class, x, y) {
      svg.append('text').attr('transform', "translate(" + x + ", " + y + ")").attr('class', text_class).attr('text-anchor', 'middle').text(text);
    };
    addChartTitles = function(svg, title, subtitle, chart_width) {
      addTextToChart(svg, title, 'chart-title', chart_width / 2, 12);
      addTextToChart(svg, subtitle, 'chart-subtitle', chart_width / 2, 30);
    };
    categoriesData = function(data) {
      var count, k, key, one, result, v, _j, _k, _l, _len, _len1, _len2, _ref, _ref1, _ref2;
      result = {
        cats: [],
        data: []
      };
      _ref = Object.keys(data).sort();
      for (count = _j = 0, _len = _ref.length; _j < _len; count = ++_j) {
        key = _ref[count];
        if (count === CHART_CATS_MAX) {
          break;
        }
        result.cats.push(key);
        if (result.data.length === 0) {
          _ref1 = data[key];
          for (_k = 0, _len1 = _ref1.length; _k < _len1; _k++) {
            one = _ref1[_k];
            k = Object.keys(one)[0];
            v = one[k];
            result.data.push([k, v]);
          }
        } else {
          _ref2 = data[key];
          for (i = _l = 0, _len2 = _ref2.length; _l < _len2; i = ++_l) {
            one = _ref2[i];
            k = Object.keys(one)[0];
            v = one[k];
            result.data[i].push(v);
          }
        }
      }
      return result;
    };
    getColor = function(v, range) {
      var index;
      index = Math.floor(v / (range / MAP_COLOR_LEVELS));
      return MAP_COLORS[index];
    };
    return {
      createNavTree: function(element, data, placeholder) {
        var $el, $searchbar, $tree_container, regions;
        $el = $(element).addClass('nav-tree');
        $searchbar = $("<div class='search-input-group input-dropdown'><input type='text' class='typeahead' placeholder='" + placeholder + "'><div class='input-group-btn'></div></div>").appendTo($el);
        regions = [];
        fetchValues(regions, data, 'name');
        $searchbar.children().first().typeahead({
          hint: true,
          highlight: true,
          minLength: 1
        }, {
          name: 'regions',
          source: substringMatcher(regions)
        }).on('typeahead:selected', function(event, item) {
          var $label, offest, region;
          $(this).val("");
          region = item.value;
          $label = $("" + element + " .tree-container >ol input[data-name='" + region + "']").next();
          offest = $label.offset().top - $("" + element + " .tree-container >ol").offset().top;
          $("" + element + " .tree-container").scrollTop(offest);
          return $label.addClass('flash').delay(1200).queue(function() {
            return $(this).removeClass('flash').dequeue();
          });
        }).on('mousedown', function() {
          return $(this).val("");
        });
        $("<div class='tree-options'><a class='select-all'>Select all</a><span>|</span><a class='clear-all'>Clear all</a></div>").appendTo($el);
        $tree_container = $("<div class='tree-container'></div>").appendTo($el);
        $(document).on('click', "" + element + " .tree-options a.select-all", function() {
          return $("" + element + " .tree-container >ol input").eq(0).prop('checked', true).change();
        });
        $(document).on('click', "" + element + " .tree-options a.clear-all", function() {
          return $("" + element + " .tree-container >ol input").eq(0).prop('checked', false).change();
        });
        createList($tree_container, data);
        $("" + element + " .tree-container >ol").bonsai({
          expandAll: true,
          checkboxes: true
        });
      },
      createDropdown: function(data, placeholder) {
        var $result;
        $result = $("<div class='input-dropdown'><input type='text' class='typeahead' placeholder='" + placeholder + "'><button class='btn'><span class='caret'></span></span></button></div>");
        return $result;
      },
      createPieChart: function(element, title, subtitle, data) {
        var $el, c3_chart, chart_config, chart_data, chart_width, k, one, svg, v, _j, _len;
        $el = $(element).empty().removeClass().addClass('pie chart');
        chart_width = $el.width();
        chart_data = [];
        for (_j = 0, _len = data.length; _j < _len; _j++) {
          one = data[_j];
          k = Object.keys(one)[0];
          v = one[k];
          chart_data.push([k, v]);
        }
        chart_config = {
          bindto: element,
          padding: {
            top: 40
          },
          color: {
            pattern: CHART_COLORS
          },
          data: {
            columns: chart_data,
            type: 'pie'
          }
        };
        if (chart_data.length === 1) {
          chart_config.data.columns.push(['Other', 100 - chart_data[0][1]]);
          chart_config.color.pattern = [CHART_COLORS[0], 'eee'];
        }
        c3_chart = c3.generate(chart_config);
        svg = d3.select("" + element + " svg");
        addChartTitles(svg, title, subtitle, chart_width);
        return c3_chart;
      },
      createLineChart: function(element, title, subtitle, data, units) {
        var $el, c3_chart, chart_config, chart_data, chart_width, svg;
        $el = $(element).empty().removeClass().addClass('line chart');
        chart_width = $el.width();
        chart_data = categoriesData(data);
        chart_config = {
          bindto: element,
          padding: {
            top: 40
          },
          color: {
            pattern: CHART_COLORS
          },
          data: {
            columns: chart_data.data,
            type: 'area'
          },
          axis: {
            x: {
              type: 'category',
              categories: chart_data.cats
            },
            y: {
              label: {
                text: units,
                position: 'outer-middle'
              },
              tick: {
                format: d3.format(',')
              }
            }
          },
          grid: {
            y: {
              show: true
            }
          }
        };
        c3_chart = c3.generate(chart_config);
        svg = d3.select("" + element + " svg");
        addChartTitles(svg, title, subtitle, chart_width);
      },
      createBarChart: function(element, title, subtitle, data, units) {
        var $el, c3_chart, chart_config, chart_data, chart_width, svg;
        $el = $(element).empty().removeClass().addClass('bar chart');
        chart_width = $el.width();
        chart_data = categoriesData(data);
        chart_config = {
          bindto: element,
          padding: {
            top: 40
          },
          color: {
            pattern: CHART_COLORS
          },
          data: {
            columns: chart_data.data,
            type: 'bar'
          },
          axis: {
            x: {
              type: 'category',
              categories: chart_data.cats
            },
            y: {
              label: {
                text: units,
                position: 'outer-middle'
              },
              tick: {
                format: d3.format(',')
              }
            }
          },
          grid: {
            y: {
              show: true
            }
          }
        };
        c3_chart = c3.generate(chart_config);
        svg = d3.select("" + element + " svg");
        addChartTitles(svg, title, subtitle, chart_width);
        $('.c3.bar line.c3-xgrid-focus').hide();
      },
      createScatterPlotChart: function(element, title, subtitle, data, unit1, unit2) {
        var $el, c3_chart, cat_key, cat_value, chart_config, chart_data, chart_width, indid_keys, svg;
        $el = $(element).empty().removeClass().addClass('scatter chart');
        chart_width = $el.width();
        chart_data = {
          'keys': {},
          'labels': [],
          'data': []
        };
        for (cat_key in data) {
          cat_value = data[cat_key];
          chart_data.keys[cat_key] = "" + cat_key + "_x";
          indid_keys = Object.keys(cat_value);
          if (indid_keys.length !== 2) {
            console.log('ERROR, only take 2 indicators');
            return;
          }
          if (chart_data.labels.length === 0) {
            chart_data.labels.push("" + indid_keys[0] + " [by " + unit1 + "]");
            chart_data.labels.push("" + indid_keys[1] + " [by " + unit2 + "]");
          }
          chart_data.data.push(["" + cat_key + "_x"].concat(cat_value[indid_keys[0]]));
          chart_data.data.push(["" + cat_key].concat(cat_value[indid_keys[1]]));
        }
        chart_config = {
          bindto: element,
          padding: {
            top: 40
          },
          color: {
            pattern: CHART_COLORS
          },
          data: {
            xs: chart_data.keys,
            columns: chart_data.data,
            type: 'scatter'
          },
          axis: {
            x: {
              label: {
                text: chart_data.labels[0],
                position: 'outer-right'
              },
              tick: {
                format: d3.format(',')
              }
            },
            y: {
              label: {
                text: chart_data.labels[1],
                position: 'outer-middle'
              },
              tick: {
                format: d3.format(',')
              }
            }
          }
        };
        c3_chart = c3.generate(chart_config);
        svg = d3.select("" + element + " svg");
        addChartTitles(svg, title, subtitle, chart_width);
      },
      createRadarChart: function(element, title, subtitle, data, unit) {
        var $el, chart_config, chart_height, chart_width, radar_chart, svg;
        $el = $(element).empty().removeClass().addClass('radar chart');
        chart_width = $el.width();
        chart_height = $el.height();
        chart_config = {
          w: chart_width - 120,
          h: chart_height - 140,
          ExtraWidthX: 120,
          ExtraWidthY: 140,
          TranslateX: 60,
          TranslateY: 75,
          radius: 3,
          opacityArea: 0.7,
          color: function(i) {
            return CHART_COLORS[i % CHART_COLORS.length];
          }
        };
        radar_chart = RadarChart.draw(element, data, chart_config);
        svg = d3.select("" + element + " svg");
        addChartTitles(svg, title, subtitle, chart_width);
        return radar_chart;
      },
      createSlider: function(element, data) {
        var $el;
        $el = $(element);
        $el.noUiSlider({
          start: 0,
          step: 1,
          range: {
            'min': 0,
            'max': data.length - 1
          }
        });
        return $el;
      },
      createSliderWithRange: function(element, data) {
        var $el;
        $el = $(element);
        $el.noUiSlider({
          start: [0, data.length - 1],
          step: 1,
          range: {
            'min': [0],
            'max': [data.length - 1]
          }
        });
        return $el;
      },
      createMapGraph: function(element) {
        var map, topLayer, topPane;
        map = L.mapbox.map(element, MAP_ID, {
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
        map.featureLayer.setFilter(function() {
          return false;
        });
        map.ochaPopup = new L.Popup({
          autoPan: false
        });
        map.ochaPopupCloseTimer = window.setTimeout(function() {
          return map.closePopup();
        }, 100);
        topPane = map._createPane('leaflet-top-pane', map.getPanes().mapPane);
        topLayer = L.mapbox.tileLayer(MAP_ID);
        topLayer.addTo(map);
        topPane.appendChild(topLayer.getContainer());
        topLayer.setZIndex(7);
        return map;
      },
      addDataToMap: function(map, data, min, max, unit) {
        var legendFrom, legendLabels, legendRange, legendTo, _j, _ref;
        if (map.ochaLegend) {
          map.legendControl.removeLegend(map.ochaLegend);
        }
        legendLabels = [];
        legendRange = max - min;
        for (i = _j = 0, _ref = MAP_COLOR_LEVELS - 1; 0 <= _ref ? _j <= _ref : _j >= _ref; i = 0 <= _ref ? ++_j : --_j) {
          legendFrom = min + i * legendRange / MAP_COLOR_LEVELS;
          legendTo = min + (i + 1) * legendRange / MAP_COLOR_LEVELS;
          legendLabels.push("<li><span class='swatch' style='background:" + (getColor(legendFrom, legendRange)) + "'></span>" + (legendFrom.toFixed(1)) + " - " + (legendTo.toFixed(1)) + "</li>");
        }
        map.ochaLegend = "<span>" + unit + "</span><ul>" + (legendLabels.join('')) + "</ul";
        map.legendControl.addLegend(map.ochaLegend);
        if (map.ochaLayer) {
          map.removeLayer(map.ochaLayer);
          map.ochaLayer = null;
        }
        map.ochaLayer = L.geoJson(data, {
          style: function(feature) {
            return {
              weight: 2,
              opacity: 0.4,
              color: '#000',
              fillOpacity: 1,
              fillColor: getColor(feature.properties.value, legendRange)
            };
          },
          onEachFeature: function(feature, layer) {
            return layer.on({
              mousemove: function(e) {
                var feature_name;
                layer = e.target;
                layer.setStyle({
                  weight: 4,
                  opacity: 1,
                  color: '#007ce0'
                });
                feature = layer.feature;
                feature_name = feature.properties.name;
                if (feature.properties.ADM1_NAME) {
                  feature_name = feature.properties.ADM1_NAME;
                  if (feature.properties.ADM2_NAME) {
                    feature_name = feature.properties.ADM2_NAME;
                  }
                }
                map.ochaPopup.setLatLng(e.latlng);
                map.ochaPopup.setContent("<div class='marker-container'> <div class='marker-number'>" + feature.properties.value + "</div> <div class='marker-label'>" + feature_name + "</div> </div>");
                if (!map.ochaPopup._map) {
                  !map.ochaPopup.openOn(map);
                }
                window.clearTimeout(map.ochaPopupCloseTimer);
              },
              mouseout: function(e) {
                layer = e.target;
                layer.setStyle({
                  weight: 2,
                  opacity: 0.4,
                  color: '#000',
                  fillOpacity: 1,
                  fillColor: getColor(feature.properties.value, legendRange)
                });
                map.ochaPopupCloseTimer = window.setTimeout(function() {
                  return map.closePopup();
                }, 100);
              }
            });
          }
        }).addTo(map);
        window.setTimeout(function() {
          if (data.features.length) {
            return map.fitBounds(map.ochaLayer.getBounds());
          } else {
            return map.setView([20, 0], 2);
          }
        }, 300);
      }
    };
  });

}).call(this);
