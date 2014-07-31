(function() {
  require(['js/ocha.js'], function(ocha) {
    $.getJSON('data/demo-tree.json', function(data) {
      return ocha.createNavTree('#the_tree', data, 'Select Country');
    });
    $.getJSON('data/demo-countries.json', function(data) {
      var $one_filter_group, one_dropdown;
      $one_filter_group = $("<div class='filter-group'><label>Location</label></div>").appendTo($('#filter_container'));
      one_dropdown = ocha.createDropdown(data, 'Any location');
      one_dropdown.appendTo($one_filter_group).on('typeahead:selected', function(event, item) {
        return console.log(item.value);
      });
      $one_filter_group = $("<div class='filter-group'><label>Format</label></div>").appendTo($('#filter_container'));
      one_dropdown = ocha.createDropdown(['XSL', 'CSV', 'TXT', 'PDF'], 'Any format');
      one_dropdown.appendTo($one_filter_group);
      $one_filter_group = $("<div class='filter-group'><label>Topic</label></div>").appendTo($('#filter_container'));
      one_dropdown = ocha.createDropdown(['Health', 'Logistics', 'Food', 'Nutrition'], 'Any topic');
      one_dropdown.appendTo($one_filter_group);
      $one_filter_group = $("<div class='filter-group'><label>License</label></div>").appendTo($('#filter_container'));
      one_dropdown = ocha.createDropdown(['License 1', 'License 2', 'License 3', 'Lisense 4'], 'Any license');
      one_dropdown.appendTo($one_filter_group);
      $one_filter_group = $("<div class='filter-group'><label>Organization</label></div>").appendTo($('#filter_container'));
      one_dropdown = ocha.createDropdown(['Organization 1', 'Organization 2', 'Organization 3', 'Organization 4'], 'Any organization');
      one_dropdown.appendTo($one_filter_group);
      $one_filter_group = $("<div class='filter-group'><label>Language</label></div>").appendTo($('#filter_container'));
      one_dropdown = ocha.createDropdown(['Language 1', 'Language 2', 'Language 3', 'Language 4'], 'Any language');
      return one_dropdown.appendTo($one_filter_group);
    });
    $("#search_filter_btn").click(function() {
      if ($("#search_filter_btn span").text() === '+') {
        return $("#search_bar_content").slideDown(300, function() {
          return $("#search_filter_btn span").text('-');
        });
      } else {
        return $("#search_bar_content").slideUp(300, function() {
          return $("#search_filter_btn span").text('+');
        });
      }
    });
  });

}).call(this);
