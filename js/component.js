(function() {
  require(['js/ocha.js'], function(ocha) {
    var MAP_FEATURES, MAP_FILE_LINK, analyzeData, downloadRegionMap, filterDataByPeriod, food_data, getValuesByRegion, mapDownloadQueue, map_graph, people_data, people_disaters_data, radar_data;
    mapDownloadQueue = [];
    MAP_FILE_LINK = 'data/fao/country';
    MAP_FEATURES = {
      "type": "FeatureCollection",
      "features": []
    };
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
    ocha.createPieChart('#pie_chart_1', 'Sample Data', 'percentage', [
      {
        'Kenya': 24
      }
    ]);
    ocha.createPieChart('#pie_chart_m', 'Sample Data', 'percentage', [
      {
        'Kenya': 24
      }, {
        'Columbia': 10
      }, {
        'Brazil': 4
      }
    ]);
    people_data = {
      '2000': [
        {
          'Refugees': 12129572
        }, {
          'Asylum seekers': 947926
        }
      ],
      '2001': [
        {
          'Refugees': 12116835
        }, {
          'Asylum seekers': 943854
        }
      ],
      '2002': [
        {
          'Refugees': 10594055
        }, {
          'Asylum seekers': null
        }
      ],
      '2003': [
        {
          'Refugees': 9592795
        }, {
          'Asylum seekers': null
        }
      ],
      '2004': [
        {
          'Refugees': 9568144
        }, {
          'Asylum seekers': 885249
        }
      ],
      '2005': [
        {
          'Refugees': 8661988
        }, {
          'Asylum seekers': 802174
        }
      ],
      '2006': [
        {
          'Refugees': 9877703
        }, {
          'Asylum seekers': 741291
        }
      ],
      '2007': [
        {
          'Refugees': 11390930
        }, {
          'Asylum seekers': 741110
        }
      ],
      '2008': [
        {
          'Refugees': 10489812
        }, {
          'Asylum seekers': 825043
        }
      ]
    };
    food_data = {
      'Benin': [
        {
          'Poor': 5
        }, {
          'Borderline': 18
        }
      ],
      'Burundi': [
        {
          'Poor': 4.8
        }, {
          'Borderline': 22.9
        }
      ],
      'Cameroon': [
        {
          'Poor': 9
        }, {
          'Borderline': 17
        }
      ],
      'Chad': [
        {
          'Poor': 16.4
        }, {
          'Borderline': 25
        }
      ],
      'Congo': [
        {
          'Poor': 6.4
        }, {
          'Borderline': 30
        }
      ],
      'Ethiopia': [
        {
          'Poor': 9.5
        }, {
          'Borderline': 16.6
        }
      ],
      'Ghana': [
        {
          'Poor': 1.6
        }, {
          'Borderline': 3.8
        }
      ],
      'Guinea': [
        {
          'Poor': 8.4
        }, {
          'Borderline': 23.7
        }
      ],
      'Haiti': [
        {
          'Poor': 5.9
        }, {
          'Borderline': 19.1
        }
      ],
      'Laos': [
        {
          'Poor': 2
        }, {
          'Borderline': 11
        }
      ],
      'Madagascar': [
        {
          'Poor': 11.9
        }, {
          'Borderline': 41.2
        }
      ],
      'Mozambique': [
        {
          'Poor': 9.1
        }, {
          'Borderline': 18.3
        }
      ],
      'Rwanda': [
        {
          'Poor': 4
        }, {
          'Borderline': 17
        }
      ]
    };
    ocha.createLineChart('#line_chart', 'People in need', 'UNHCR', people_data, 'Count');
    ocha.createBarChart('#bar_chart', 'People in need', 'UNHCR', food_data, '% of households');
    people_disaters_data = {
      'Afghanistan': {
        'Disasters': [1, 3, 5, 2, 4, 5, 1, 3, 5, 6, 3, 2, 5, 4, 3],
        'People In Need': [2183376, 2669907, 4931460, 4719807, 5821096, 5077223, 2565772, 2631740, 3589846, 5821096, 4314459]
      },
      'Columbia': {
        'Disasters': [1, 3, 2, 3, 2, 5, 8, 2, 2, 5, 3, 1, 1, 0, 1],
        'People In Need': [11178682, 1278645, 1667607, 5496767, 1673912, 1604307, 830039, 1150627, 1373770, 2744021, 1229886, 1044160, 1013355, 864034]
      },
      'YEM': {
        'Disasters': [0, 1, 1, 0, 0, 0, 1, 0, 1, 2, 0, 0, 0, 0, 0],
        'People In Need': [682458, 736136, 245499, 403099, 276198, 0, 75632, 0, 12518, 0, 0, 0, 0, 0, 0]
      }
    };
    ocha.createScatterPlotChart('#scatter_plot_chart', 'Disasters VS People in need', '', people_disaters_data, 'Count', 'Count');
    radar_data = [
      {
        key: 'Haiti',
        axes: [
          {
            axis: "Male Overweight",
            value: 4.1
          }, {
            axis: "Female Overweight",
            value: 3.1
          }, {
            axis: "Male Stunted",
            value: 23.4
          }, {
            axis: "Female Stunted",
            value: 20.3
          }, {
            axis: "Male Wasted",
            value: 5.2
          }, {
            axis: "Female Wasted",
            value: 5.6
          }
        ]
      }, {
        key: 'Mexico',
        axes: [
          {
            axis: "Male Overweight",
            value: 9.0
          }, {
            axis: "Female Overweight",
            value: 9.0
          }, {
            axis: "Male Stunted",
            value: 15.1
          }, {
            axis: "Female Stunted",
            value: 12.1
          }, {
            axis: "Male Wasted",
            value: 1.8
          }, {
            axis: "Female Wasted",
            value: 1.4
          }
        ]
      }
    ];
    ocha.createRadarChart('#radar_chart', 'Children Aged < 5 years', '2012', radar_data, 'percentage');
    map_graph = ocha.createMapGraph('map');
    $.getJSON("https://ocha.parseapp.com/getdata?indid=CHD.B.FOS.04.T6", function(data) {
      var data_fact, k, map_download_event, v;
      data_fact = analyzeData(data);
      data = filterDataByPeriod(data, '2005-2006');
      data = getValuesByRegion(data, ['TZA/115003', 'TZA/115004', 'TZA/115006', 'TZA/115008', 'TZA/115009', 'TZA/48357', 'TZA/48359', 'TZA/48362', 'TZA/48363', 'TZA/48364', 'TZA/48365', 'TZA/48366', 'TZA/48367', 'TZA/48368', 'TZA/48369', 'TZA/48373', 'TZA/48375', 'TZA/48377', 'TZA/48380,TZA/48381']);
      MAP_FEATURES['features'] = [];
      for (k in data) {
        v = data[k];
        map_download_event = downloadRegionMap(k, v);
        mapDownloadQueue.push(map_download_event);
      }
      return $.when.apply($, mapDownloadQueue).done(function() {
        return ocha.addDataToMap(map_graph, MAP_FEATURES, data_fact.min, data_fact.max, 'Percent');
      });
    });
    ocha.createSlider('#slider_ui', ['1995', '1996', '1997', '1998', '1999']);
    ocha.createSliderWithRange('#slider_range', ['1995', '1996', '1997', '1998', '1999', '2000', '2001', '2002', '2003', '2005']);
    $.getJSON('data/demo-tree.json', function(data) {
      return ocha.createNavTree('#the_tree', data, 'Select Country');
    });
    $.getJSON('data/demo-countries.json', function(data) {
      var $country_filter, one, _i, _len;
      $country_filter = $('#country_filter select');
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        one = data[_i];
        $("<option value='" + one + "'>" + one + "</option>").appendTo($country_filter);
      }
      return $('.combobox').combobox();
    });
  });

}).call(this);
