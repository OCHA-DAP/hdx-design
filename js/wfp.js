(function() {
  requirejs.config({
    paths: {
      jquery: 'lib/jquery.v1.11.1.min',
      bootstrap: 'lib/bootstrap.v3.1.1.min',
      mapbox: 'lib/mapbox.v1.6.4',
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
    var COLOR_LEVELS, FILE_LINK, MAP_JSON, MAP_UNITS, closeTooltip, color_map, color_scale, featureClicked, getColor, getLegendHTML, getMapFilePath, getStyle, highlightFeature, i, map, mapID, onEachFeature, openURL, popup, resetFeature, topLayer, topPane, _i;
    $('.chosen-select').chosen({
      no_results_text: "Oops, nothing found!"
    });
    return;
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
      var countryID, feature, layer;
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
      popup.setLatLng(e.latlng);
      popup.setContent("<div class='marker-container'> <div class='marker-number'>" + feature.properties.value + "</div> <div class='marker-label'>" + MAP_UNITS + "</div> </div>");
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
    getMapFilePath = function(dic) {
      if (dic['admin2'] !== 'NA') {
        return "" + FILE_LINK + "/" + dic['region'] + "/" + dic['admin1'] + "/" + dic['admin2'] + ".json";
      }
      if (dic['admin1'] !== 'NA') {
        return "" + FILE_LINK + "/" + dic['region'] + "/" + dic['admin1'] + ".json";
      } else {
        return "" + FILE_LINK + "/" + dic['region'] + ".json";
      }
    };
    MAP_JSON = {
      "type": "FeatureCollection",
      "features": []
    };
    $.getJSON('http://ocha.parseapp.com/getmapdata?period=2009&indid=CHD.B.FOS.06.T6', function(data) {
      var file, jsonQueue, one, _j, _len;
      jsonQueue = [];
      for (_j = 0, _len = data.length; _j < _len; _j++) {
        one = data[_j];
        MAP_UNITS = one['units'];
        file = getMapFilePath(one);
        jsonQueue.push($.getJSON(file, function(map_json) {
          var _k, _len1;
          for (_k = 0, _len1 = data.length; _k < _len1; _k++) {
            one = data[_k];
            if (one['region_name'] === map_json['properties']['ADM0_NAME']) {
              map_json['properties']['value'] = parseInt(one['value']);
              break;
            }
          }
          return MAP_JSON['features'].push(map_json);
        }));
      }
      map.legendControl.addLegend(getLegendHTML());
      return $.when.apply($, jsonQueue).done(function() {
        var countryLayer;
        console.log(MAP_JSON);
        countryLayer = L.geoJson(MAP_JSON, {
          style: getStyle,
          onEachFeature: onEachFeature
        });
        countryLayer.addTo(map);
        return map.fitBounds(countryLayer.getBounds());
      });
    });
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
