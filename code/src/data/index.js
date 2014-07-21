var index_json = {
  "name": "START",
  "type": 'root',
  "children": [{
    "name": "One",
    "type": "indicator",
    "children": [{
      "name": "One",
      "type": "timestamp",
      "children": [{
        "name": "One Country",
        "type": "region",
        "url": "/1_1_1_country.html",
        "recommend": 'P',
        "options": ['B']
      }, {
        "name": "Many Countries",
        "type": "region",
        "url": "/1_1_m_countries.html",
        "recommend": 'M',
        "options": ['P', 'B', 'R', 'L']
      }, {
        "name": "One State",
        "type": "region",
        "url": "/1_1_1_state.html",
        "recommend": 'P',
        "options": ['B']
      }, {
        "name": "Many States",
        "type": "region",
        "url": "/1_1_m_states.html",
        "recommend": 'M',
        "options": ['P', 'B', 'R', 'L']
      }, {
        "name": "One City",
        "type": "region",
        "url": "/1_1_1_city.html",
        "recommend": 'P',
        "options": ['B']
      }, {
        "name": "Many Cities",
        "type": "region",
        "url": "/1_1_m_cities.html",
        "recommend": 'M',
        "options": ['P', 'B', 'R', 'L']
      }]
    }, {
      "name": "Many",
      "type": "timestamp",
      "children": [{
        "name": "One Country",
        "type": "region",
        "url": "/1_m_1_country.html",
        "recommend": 'L',
        "options": ['B']
      }, {
        "name": "Many Countries",
        "type": "region",
        "url": "/1_m_m_countries.html",
        "recommend": 'M',
        "options": ['P', 'B', 'R', 'L']
      }, {
        "name": "One State",
        "type": "region",
        "url": "/1_m_1_state.html",
        "recommend": 'L',
        "options": ['B']
      }, {
        "name": "Many States",
        "type": "region",
        "url": "/1_m_m_states.html",
        "recommend": 'M',
        "options": ['P', 'B', 'R', 'L']
      }, {
        "name": "One City",
        "type": "region",
        "url": "/1_m_1_city.html",
        "recommend": 'L',
        "options": ['B']
      }, {
        "name": "Many Cities",
        "type": "region",
        "url": "/1_m_m_cities.html",
        "recommend": 'M',
        "options": ['P', 'B', 'R', 'L']
      }]
    }]
  }, {
    "name": "Many",
    "type": "indicator",
    "children": [{
      "name": "One",
      "type": "timestamp",
      "children": [{
        "name": "One Country",
        "type": "region",
        "url": "/m_1_1_country.html",
        "recommend": 'R',
        "options": ['P', 'B', 'L']
      }, {
        "name": "Many Countries",
        "type": "region",
        "url": "/m_1_m_countries.html",
        "recommend": 'S',
        "options": ['L', 'R', 'B']
      }, {
        "name": "One State",
        "type": "region",
        "url": "/m_1_1_state.html",
        "recommend": 'R',
        "options": ['P', 'B', 'L']
      }, {
        "name": "Many States",
        "type": "region",
        "url": "/m_1_m_states.html",
        "recommend": 'S',
        "options": ['L', 'R', 'B']
      }, {
        "name": "One City",
        "type": "region",
        "url": "/m_1_1_city.html",
        "recommend": 'R',
        "options": ['P', 'B', 'L']
      }, {
        "name": "Many Cities",
        "type": "region",
        "url": "/m_1_m_cities.html",
        "recommend": 'S',
        "options": ['L', 'R', 'B']
      }]
    }, {
      "name": "Many",
      "type": "timestamp",
      "children": [{
        "name": "One Country",
        "type": "region",
        "url": "/m_m_1_country.html",
        "recommend": 'B',
        "options": ['L', 'R']
      }, {
        "name": "Many Countries",
        "type": "region",
        "url": "/m_m_m_countries.html",
        "recommend": 'B',
        "options": ['L', 'R']
      }, {
        "name": "One State",
        "type": "region",
        "url": "/m_m_1_state.html",
        "recommend": 'B',
        "options": ['L', 'R']
      }, {
        "name": "Many States",
        "type": "region",
        "url": "/m_m_m_states.html",
        "recommend": 'B',
        "options": ['L', 'R']
      }, {
        "name": "One City",
        "type": "region",
        "url": "/m_m_1_city.html",
        "recommend": 'B',
        "options": ['L', 'R']
      }, {
        "name": "Many Cities",
        "type": "region",
        "url": "/m_m_m_cities.html",
        "recommend": 'B',
        "options": ['L', 'R']
      }]
    }]
  }]
}
