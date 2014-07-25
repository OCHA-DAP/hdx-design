(function() {
  requirejs.config({
    paths: {
      jquery: 'lib/jquery.v1.11.1.min',
      bootstrap: 'lib/bootstrap.v3.1.1.min',
      mapbox: 'lib/mapbox.v1.6.4',
      leaflet_omnivore: 'lib/leaflet.omnivore.v0.2.0.min',
      leaflet_fullscreen: 'lib/Leaflet.fullscreen.v0.0.3.min',
      d3: 'lib/d3.v3.min',
      c3: 'lib/c3.v0.2.4'
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
      }
    }
  });

  require(['d3', 'c3', 'jquery', 'bootstrap', 'mapbox', 'leaflet_omnivore', 'leaflet_fullscreen', 'data/world_json.js', 'data/regional_codes.js', 'data/mortality.js'], function(d3, c3) {
    var another, chartData, chartUnits, chart_colors, chart_config, country_code, country_name, globalRate, index, mortalityData, one, openURL, _i, _j, _len, _len1, _ref, _ref1;
    country_code = location.search.split('code=')[1];
    if (!country_code) {
      country_code = 'COL';
    } else {
      country_code = country_code.toUpperCase();
    }
    country_name = '';
    for (_i = 0, _len = regional_codes.length; _i < _len; _i++) {
      one = regional_codes[_i];
      if (one['alpha-3'] === country_code) {
        country_name = one['name'];
        break;
      }
    }
    openURL = function(url) {
      return window.open(url, '_blank').focus();
    };
    chart_colors = ['555555', '1ebfb3'];
    chart_config = {
      bindto: '.chart',
      color: {
        pattern: chart_colors
      },
      axis: {
        y: {
          label: {
            text: '',
            position: 'outer-middle'
          }
        }
      }
    };
    chartUnits = 'per 1,000 female adults';
    chartData = {};
    mortalityData = [];
    if (mortality_rates[country_code]) {
      mortalityData = mortality_rates[country_code];
    } else {
      mortalityData = mortality_rates['default'];
    }
    chartData['year'] = mortalityData['year'];
    globalRate = [];
    _ref = chartData['year'];
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      one = _ref[_j];
      _ref1 = mortality_rates['global']['year'];
      for (index in _ref1) {
        another = _ref1[index];
        if (one === another) {
          globalRate.push(mortality_rates['global']['rate'][index]);
          break;
        }
      }
    }
    chartData['Global'] = globalRate;
    chartData[country_name] = mortalityData['rate'];
    chart_config.data = {
      x: 'year',
      json: chartData,
      type: 'area'
    };
    chart_config.axis.y.label.text = chartUnits;
    c3.generate(chart_config);
  });

}).call(this);
