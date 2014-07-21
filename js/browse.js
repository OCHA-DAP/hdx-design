(function() {
  $(document).ready(function() {
    var char, closeTooltip, column, columns, country, countryLayer, country_id, country_list, feature, featureClicked, first_letter, getStyle, highlightFeature, map, mapID, onEachFeature, one_char_box, one_char_labe, one_column, popup, resetFeature, topLayer, topPane, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _results;
    mapID = 'xyfeng.ijpo6lio';
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
      popup.setContent("<div class='marker-number'>" + layer.feature.properties.value + "</div><div class='marker-label'>indicators</div>");
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
      var countryName, layer;
      layer = e.target;
      countryName = layer.feature.properties.name;
      console.log(countryName + ' is clicked');
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
      feature.properties.value = 0;
      if (countries[first_letter]) {
        _ref1 = countries[first_letter];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          country = _ref1[_j];
          if (country[0] === country_id) {
            feature.properties.value = country[2];
            console.log(country[2]);
            break;
          }
        }
      }
    }
    map = L.mapbox.map('map', mapID, {
      center: [20, 10],
      zoom: 2,
      minZoom: 2,
      maxZoom: 4,
      tileLayer: {
        continuousWorld: false,
        noWrap: true
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
    _results = [];
    for (_k = 0, _len2 = columns.length; _k < _len2; _k++) {
      column = columns[_k];
      one_column = $('<div class="col-md-2"></div>').appendTo(country_list);
      _results.push((function() {
        var _l, _len3, _results1;
        _results1 = [];
        for (_l = 0, _len3 = column.length; _l < _len3; _l++) {
          char = column[_l];
          one_char_box = $("<div class='char-box'></div>").appendTo(one_column);
          one_char_labe = $("<div class='char-label'>" + char + "</div>").appendTo(one_char_box);
          _results1.push((function() {
            var _len4, _m, _ref2, _results2;
            _ref2 = countries[char];
            _results2 = [];
            for (_m = 0, _len4 = _ref2.length; _m < _len4; _m++) {
              country = _ref2[_m];
              if (country[2] === 0) {
                _results2.push($("<div class='country-item inactive'>" + country[1] + "</div>").appendTo(one_char_box));
              } else {
                _results2.push($("<div class='country-item'>" + country[1] + "</div>").appendTo(one_char_box));
              }
            }
            return _results2;
          })());
        }
        return _results1;
      })());
    }
    return _results;
  });

}).call(this);
