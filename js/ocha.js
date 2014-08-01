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

  define(['jquery', 'bootstrap', 'mapbox', 'leaflet_omnivore', 'leaflet_fullscreen', 'd3', 'c3', 'chroma', 'chosen', 'bonsai', 'qubit', 'typeahead', 'radarchart'], function($, b, m, o, f, d3, c3, chroma) {
    var CHART_CATS_MAX, addChartTitles, addTextToChart, categoriesData, chart_colors, createList, fetchValues, substringMatcher;
    chart_colors = ['1ebfb3', '117be1', 'f2645a', '555555', 'ffd700'];
    CHART_CATS_MAX = 30;
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
      var $li, $ol, attributes, children_count_label, expand_attr, k, keys, one, _i, _j, _len, _len1;
      $ol = $("<ol></ol>").appendTo($el);
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        one = data[_i];
        expand_attr = "";
        attributes = "";
        children_count_label = "";
        keys = Object.keys(one);
        for (_j = 0, _len1 = keys.length; _j < _len1; _j++) {
          k = keys[_j];
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
      var one, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        one = data[_i];
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
      var count, i, k, key, one, result, v, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      result = {
        cats: [],
        data: []
      };
      _ref = Object.keys(data).sort();
      for (count = _i = 0, _len = _ref.length; _i < _len; count = ++_i) {
        key = _ref[count];
        if (count === CHART_CATS_MAX) {
          break;
        }
        result.cats.push(key);
        if (result.data.length === 0) {
          _ref1 = data[key];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            one = _ref1[_j];
            k = Object.keys(one)[0];
            v = one[k];
            result.data.push([k, v]);
          }
        } else {
          _ref2 = data[key];
          for (i = _k = 0, _len2 = _ref2.length; _k < _len2; i = ++_k) {
            one = _ref2[i];
            k = Object.keys(one)[0];
            v = one[k];
            result.data[i].push(v);
          }
        }
      }
      return result;
    };
    return {
      createNavTree: function(element, data, placeholder) {
        var $el, $searchbar, $tree_container, regions;
        $el = $(element).addClass('nav-tree');
        $searchbar = $("<div class='search-input-group input-dropdown'><input type='text' class='typeahead' placeholder='" + placeholder + "'><div class='input-group-btn'></div></div>").appendTo($el);
        regions = [];
        fetchValues(regions, data, 'name');
        $searchbar.children().first().typeahead(null, {
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
          return $("" + element + " .tree-container >ol input").prop('checked', true);
        });
        $(document).on('click', "" + element + " .tree-options a.clear-all", function() {
          return $("" + element + " .tree-container >ol input").prop('checked', false);
        });
        createList($tree_container, data);
        $("" + element + " .tree-container >ol").bonsai({
          expandAll: true,
          checkboxes: true
        });
      },
      createDropdown: function(data, placeholder) {
        var $result;
        $result = $("<div class='input-dropdown'><input type='text' class='typeahead' placeholder='" + placeholder + "'></div>");
        $result.children().first().typeahead(null, {
          source: substringMatcher(data)
        });
        return $result;
      },
      createPieChart: function(element, title, subtitle, data) {
        var $el, c3_chart, chart_config, chart_data, chart_width, k, one, svg, v, _i, _len;
        $el = $(element).empty().removeClass().addClass('pie chart');
        chart_width = $el.width();
        chart_data = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          one = data[_i];
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
            pattern: chart_colors
          },
          data: {
            columns: chart_data,
            type: 'pie'
          }
        };
        if (chart_data.length === 1) {
          chart_config.data.columns.push(['Other', 100 - chart_data[0][1]]);
          chart_config.color.pattern = [chart_colors[0], 'eee'];
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
            pattern: chart_colors
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
            pattern: chart_colors
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
            pattern: chart_colors
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
        var $el, chart_config, chart_height, chart_width, svg;
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
            return chart_colors[i % chart_colors.length];
          }
        };
        RadarChart.draw(element, data, chart_config);
        svg = d3.select("" + element + " svg");
        console.log(svg);
        addChartTitles(svg, title, subtitle, chart_width);
      }
    };
  });

}).call(this);
