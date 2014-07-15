(function() {
  $(document).ready(function() {
    var countryLayer, featureClicked, getStyle, highlightFeature, map, mapID, onEachFeature, popup, resetFeature, topLayer, topPane;
    mapID = 'xyfeng.ijpo6lio';
    getStyle = function(feature) {
      return {
        weight: 0,
        fillOpacity: 1,
        fillColor: '#fff'
      };
    };
    highlightFeature = function(e) {
      var countryID, layer;
      console.log(11);
      layer = e.target;
      countryID = layer.feature.id;
      layer.setStyle({
        weigth: 1,
        opacity: 0.2,
        color: '#ccc',
        fillOpacity: 1.0,
        fillColor: '#eee'
      });
    };
    resetFeature = function(e) {};
    featureClicked = function(e) {};
    onEachFeature = function(feature, layer) {
      console.log(22);
      layer.on({
        mousemove: highlightFeature,
        mouseout: resetFeature,
        click: featureClicked
      });
    };
    map = L.mapbox.map('map').setView([20, 10], 2);
    popup = new L.Popup({
      autoPan: false
    });
    countryLayer = L.geoJson(worldJSON, {
      style: getStyle,
      onEachFeature: onEachFeature
    });
    countryLayer.addTo(map);
    topPane = map._createPane('leaflet-top-pane', map.getPanes().mapPane);
    topLayer = L.mapbox.tileLayer(mapID).addTo(map);
    topPane.appendChild(topLayer.getContainer());
    topLayer.setZIndex(7);
  });

}).call(this);
