(function() {
  require(['js/ocha.js'], function(ocha) {
    var data;
    data = [
      {
        name: 'All Regions',
        key: 'all',
        expanded: true,
        "class": 'active',
        children: [
          {
            name: 'Lao PDR',
            key: 'LAO'
          }, {
            name: 'Tanzania',
            key: 'TZA',
            children: [
              {
                name: 'Iringa',
                key: '0001',
                path: 'TZA/0001',
                children: []
              }
            ]
          }
        ]
      }
    ];
    ocha.createNavTree('#the_tree', data, 'Select Country');
  });

}).call(this);
