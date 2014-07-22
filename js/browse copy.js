(function() {
  $(document).ready(function() {
    var char, closeTooltip, code, column, columns, country, countryLayer, country_id, country_list, feature, featureClicked, first_letter, getStyle, highlightFeature, k, map, mapID, onEachFeature, one_char_box, one_char_labe, one_column, openURL, popup, resetFeature, topLayer, topPane, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1;
    mapID = 'yumiendo.ijchbik8';
    openURL = function(url) {
      return window.open(url, '_blank').focus();
    };
    getStyle = function(feature) {
      return {
        weight: 0,
        fillOpacity: 1,
        fillColor: '#fff'
      };
    };
    closeTooltip = window.setTimeout(function() {
      return map.closePopup();
    }, 100);
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
      popup.setLatLng(e.latlng);
      popup.setContent("<div class='marker-container'> <div class='marker-box'> <div class='marker-number'>" + layer.feature.properties.indicators + "</div> <div class='marker-label'>indicators</div> </div> <div class='line-break'></div> <div class='marker-box'> <div class='marker-number'>" + layer.feature.properties.datasets + "</div> <div class='marker-label'>datasets</div> </div> </div>");
      if (!popup._map) {
        popup.openOn(map);
      }
      window.clearTimeout(closeTooltip);
    };
    resetFeature = function(e) {
      var layer;
      layer = e.target;
      layer.setStyle({
        weigth: 0,
        fillOpacity: 1.0,
        fillColor: '#fff'
      });
      closeTooltip = window.setTimeout(function() {
        return map.closePopup();
      }, 100);
    };
    featureClicked = function(e) {
      var code, layer;
      layer = e.target;
      code = layer.feature.id.toLowerCase();
      openURL("http://data.hdx.rwlabs.org/group/" + code);
    };
    onEachFeature = function(feature, layer) {
      layer.on({
        mousemove: highlightFeature,
        mouseout: resetFeature,
        click: featureClicked
      });
    };
    _ref = worldJSON['features'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      feature = _ref[_i];
      country_id = feature.id;
      first_letter = country_id.substring(0, 1);
      feature.properties.datasets = 0;
      feature.properties.indicators = 0;
      for (k in countries) {
        v = countries[k];
        for (_j = 0, _len1 = v.length; _j < _len1; _j++) {
          country = v[_j];
          if (country[0] === country_id) {
            feature.properties.datasets = country[2];
            feature.properties.indicators = country[3];
            break;
          }
        }
      }
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
    columns = [['A', 'B', 'C'], ['D', 'E', 'F', 'G', 'H'], ['I', 'J', 'K', 'L'], ['M', 'N', 'O', 'P'], ['Q', 'R', 'S', 'T'], ['U', 'V', 'Y', 'Z']];
    country_list = $('#country_list');
    for (_k = 0, _len2 = columns.length; _k < _len2; _k++) {
      column = columns[_k];
      one_column = $('<div class="col-md-2"></div>').appendTo(country_list);
      for (_l = 0, _len3 = column.length; _l < _len3; _l++) {
        char = column[_l];
        one_char_box = $("<div class='char-box'></div>").appendTo(one_column);
        one_char_labe = $("<div class='char-label'>" + char + "</div>").appendTo(one_char_box);
        _ref1 = countries[char];
        for (_m = 0, _len4 = _ref1.length; _m < _len4; _m++) {
          country = _ref1[_m];
          if (country.length === 2) {
            $("<div class='country-item inactive'>" + country[1] + "</div>").appendTo(one_char_box);
          } else {
            code = country[0].toLowerCase();
            $("<div class='country-item' data-code='" + code + "'>" + country[1] + "</div>").appendTo(one_char_box);
          }
        }
      }
    }
    $('.country-item').on('click', function(e) {
      code = $(this).data('code');
      if (code) {
        openURL("http://data.hdx.rwlabs.org/group/" + code);
      }
    });
  });

}).call(this);
