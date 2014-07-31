(function() {
  require(['js/ocha.js'], function(ocha) {
    $.getJSON('data/demo-tree.json', function(data) {
      return ocha.createNavTree('#the_tree', data, 'Select Country');
    });
    $.getJSON('data/demo-countries.json', function(data) {
      var dropdown1;
      dropdown1 = ocha.createDropdown(data, 'Any Location');
      return dropdown1.appendTo($('#dropdown_session')).on('typeahead:selected', function(event, item) {
        return console.log(item.value);
      });
    });
  });

}).call(this);
