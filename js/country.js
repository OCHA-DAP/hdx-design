(function() {
  requirejs.config({
    paths: {
      jquery: 'lib/jquery.v1.11.1.min',
      bootstrap: 'lib/bootstrap.v3.1.1.min',
      mapbox: 'lib/mapbox.v1.6.4',
      leaflet_omnivore: 'lib/leaflet.omnivore.v0.2.0.min',
      leaflet_fullscreen: 'lib/Leaflet.fullscreen.v0.0.3.min',
      d3: 'lib/d3.v3.min'
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
      }
    }
  });

  require(['jquery', 'bootstrap', 'd3', 'mapbox', 'leaflet_omnivore', 'leaflet_fullscreen', 'data/world_json.js', 'data/regional_codes.js', 'data/countries.js'], function() {
    var chartData, chartUnits, chart_colors, chart_config, countryLayer, country_code, featureClicked, getStyle, highlightFeature, map, mapID, onEachFeature, openURL, popup, resetFeature, topLayer, topPane;
    mapID = 'yumiendo.ijchbik8';
    openURL = function(url) {
      return window.open(url, '_blank').focus();
    };
    getStyle = function(feature) {
      if (feature.id === country_code) {
        return {
          weight: 1,
          opacity: 0.2,
          fillOpacity: 1,
          fillColor: '#f5837b'
        };
      } else {
        return {
          weight: 0,
          fillOpacity: 1,
          fillColor: '#f2f2ef'
        };
      }
    };
    highlightFeature = function(e) {
      var countryID, layer;
      layer = e.target;
      countryID = layer.feature.id;
      layer.setStyle({
        weigth: 1,
        opacity: 0.2,
        color: '#ccc',
        fillOpacity: 1.0,
        fillColor: '#f5837b'
      });
    };
    resetFeature = function(e) {
      var layer, layer_style;
      layer = e.target;
      layer_style = getStyle(layer.feature);
      layer.setStyle(layer_style);
    };
    featureClicked = function(e) {
      var code, layer;
      layer = e.target;
      code = layer.feature.id.toLowerCase();
      openURL("country.html?code=" + code);
    };
    onEachFeature = function(feature, layer) {
      var country_name;
      if (feature.id === country_code) {
        country_name = feature.properties.name;
        $('#title_label').html(country_name);
        map.fitBounds(layer.getBounds());
      }
      layer.on({
        mousemove: highlightFeature,
        mouseout: resetFeature,
        click: featureClicked
      });
    };
    country_code = location.search.split('code=')[1];
    if (!country_code) {
      country_code = 'COL';
    } else {
      country_code = country_code.toUpperCase();
    }
    map = L.mapbox.map('map', mapID, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 4,
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
    countryLayer = L.geoJson(worldJSON, {
      style: getStyle,
      onEachFeature: onEachFeature
    });
    countryLayer.addTo(map);
    topPane = map._createPane('leaflet-top-pane', map.getPanes().mapPane);
    topLayer = L.mapbox.tileLayer(mapID);
    topLayer.addTo(map);
    topPane.appendChild(topLayer.getContainer());
    topLayer.setZIndex(7);
    chart_colors = ['1ebfb3', '117be1', 'f2645a', '555555', 'ffd700'];
    chart_config = {
      bindto: '#chart',
      color: {
        pattern: chart_colors
      }
    };
    chartUnits = 'per 1,000 female adults';
    chartData = {};
    chartData['x'] = ['1997', '1998', '1999', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011'];
    chartData['rate'] = [113.419, 111.6132, 109.8074, 108.0016, 106.1958, 104.39, 102.307, 100.224, 98.141, 96.058, 93.975, 92.4752, 90.9754, 89.4756, 87.9758];
    chart_config.data = {
      x: 'x',
      json: chartData,
      type: 'area'
    };
    c3.generate(chart_config);
    $('#chart').on('click', function() {
      return openURL('indicator.html');
    });
  });

}).call(this);
