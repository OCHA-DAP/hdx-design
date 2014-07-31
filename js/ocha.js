(function() {
  requirejs.config({
    paths: {
      jquery: 'lib/jquery.v1.11.1.min',
      bootstrap: 'lib/bootstrap.v3.1.1.min',
      mapbox: 'https://api.tiles.mapbox.com/mapbox.js/v1.6.4/mapbox',
      leaflet_omnivore: 'lib/leaflet.omnivore.v0.2.0.min',
      leaflet_fullscreen: 'lib/Leaflet.fullscreen.v0.0.3.min',
      chroma: 'lib/chroma.min',
      d3: 'lib/d3.v3.min',
      c3: 'lib/c3.v0.2.4',
      chosen: 'lib/chosen.v1.1.min',
      bonsai: 'lib/tree/jquery.bonsai',
      qubit: 'lib/tree/jquery.qubit',
      typeahead: 'lib/typeahead.jquery'
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
      },
      'qubit': {
        deps: ['jquery']
      },
      'bonsai': {
        deps: ['jquery', 'qubit']
      },
      'typeahead': {
        deps: ['jquery']
      }
    }
  });

  define(['jquery', 'bootstrap', 'mapbox', 'leaflet_omnivore', 'leaflet_fullscreen', 'd3', 'c3', 'chroma', 'chosen', 'bonsai', 'qubit', 'typeahead'], function($, b, m, o, f, d3, c3, chroma) {
    var createList, fetchValues, substringMatcher;
    substringMatcher = function(strs) {
      var findMatches;
      return findMatches = function(q, cb) {
        var matches, substrRegex;
        matches = void 0;
        substrRegex = void 0;
        matches = [];
        substrRegex = new RegExp(q, "i");
        $.each(strs, function(i, str) {
          if (substrRegex.test(str)) {
            matches.push({
              value: str
            });
          }
        });
        cb(matches);
      };
    };
    createList = function($el, data) {
      var $li, $ol, attributes, children_count_label, expand_attr, k, keys, one, _i, _j, _len, _len1;
      $ol = $("<ol></ol>").appendTo($el);
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        one = data[_i];
        expand_attr = "";
        attributes = "";
        children_count_label = "";
        keys = Object.keys(one);
        for (_j = 0, _len1 = keys.length; _j < _len1; _j++) {
          k = keys[_j];
          if (k !== 'name' && k !== 'children' && k !== 'class' && k !== 'expanded') {
            attributes = "" + attributes + "data-" + k + "='" + one[k] + "' ";
          }
          if (k === 'expanded' && one[k]) {
            expand_attr = "class='expanded'";
          }
          if (k === 'children' && one[k].length) {
            children_count_label = "<span>" + one[k].length + "</span>";
          }
        }
        $li = $("<li " + expand_attr + "><input type='checkbox' class='" + (one["class"] || ' ') + "' " + attributes + "data-name='" + one.name + "'><label>" + one.name + "</label>" + children_count_label + "</li>").appendTo($ol);
        if (children_count_label !== '') {
          createList($li, one.children);
        }
      }
    };
    fetchValues = function(array, data, key) {
      var one, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        one = data[_i];
        array.push(one[key]);
        if (one.children && one.children.length) {
          _results.push(fetchValues(array, one.children, key));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    return {
      createNavTree: function(element, data, placeholder) {
        var $el, $searchbar, regions;
        $el = $(element).addClass('nav-tree');
        $searchbar = $("<div class='search-input-group'><input type='text' class='typeahead' placeholder='" + placeholder + "'><div class='input-group-btn'></div></div>").appendTo($el);
        regions = [];
        fetchValues(regions, data, 'name');
        $searchbar.children().first().typeahead(null, {
          name: 'regions',
          source: substringMatcher(regions)
        }).on('typeahead:selected', function(event, item) {
          var $input, region;
          $(this).val("");
          region = item.value;
          $input = $("" + element + " >ol input[data-name='" + region + "']");
          return $input.prop('checked', true).triggerHandler('click');
        });
        createList($el, data);
        $("" + element + " >ol").bonsai({
          checkboxes: true
        });
      }
    };
  });

}).call(this);
