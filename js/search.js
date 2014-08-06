(function() {
  require(['js/ocha.js'], function(ocha) {
    $.getJSON('data/demo-countries.json', function(data) {
      var $country_filter, one, _i, _len;
      $country_filter = $('#country_filter select');
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        one = data[_i];
        $("<option value='" + one + "'>" + one + "</option>").appendTo($country_filter);
      }
      return $('.combobox').combobox();
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
