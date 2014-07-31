require ['js/ocha.js'], (ocha)->
  data = [
    {
      name: 'All Regions',
      key: 'all',
      expanded: true,
      class: 'active'
      children: [
        {
          name: 'Lao PDR',
          key: 'LAO'
        },
        {
          name: 'Cameroon',
          key: 'LAO'
        },
        {
          name: 'Regions of Cameroon',
          key: 'LAO',
          children: [
            {
              name: 'Adamaoua',
              key: '0001'
            },
            {
              name: 'Centre',
              key: '0001'
            },
            {
              name: 'Est',
              key: '0001'
            },
            {
              name: 'Littoral',
              key: '0001'
            },
            {
              name: 'Nord',
              key: '0001'
            },
            {
              name: 'Ouest',
              key: '0001'
            }
          ]
        },
        {
          name: 'Tanzania',
          key: 'TZA',
          children:[
            {
              name: 'Iringa',
              key: '0001',
              path: 'TZA/0001',
              children: []
            },
            {
              name: 'Kagera',
              key: '0001',
              path: 'TZA/0001',
              children: []
            },
            {
              name: 'Mwanza',
              key: '0001',
              path: 'TZA/0001',
              children: []
            },
            {
              name: 'Rukwa',
              key: '0001',
              path: 'TZA/0001',
              children: []
            },
            {
              name: 'Shinyanga',
              key: '0001',
              path: 'TZA/0001',
              children: []
            },
            {
              name: 'Arusha',
              key: '0001',
              path: 'TZA/0001',
              children: []
            },
            {
              name: 'Dodoma',
              key: '0001',
              path: 'TZA/0001',
              children: []
            },
            {
              name: 'Kigoma',
              key: '0001',
              path: 'TZA/0001',
              children: []
            },
            {
              name: 'Kilimanjaro',
              key: '0001',
              path: 'TZA/0001',
              children: []
            },
            {
              name: 'Manyara',
              key: '0001',
              path: 'TZA/0001',
              children: []
            },
            {
              name: 'Mara',
              key: '0001',
              path: 'TZA/0001',
              children: []
            },
            {
              name: 'Mbeya',
              key: '0001',
              path: 'TZA/0001',
              children: []
            },
            {
              name: 'Morogoro',
              key: '0001',
              path: 'TZA/0001',
              children: []
            },
            {
              name: 'Mtwara',
              key: '0001',
              path: 'TZA/0001',
              children: []
            },
            {
              name: 'Pwani',
              key: '0001',
              path: 'TZA/0001',
              children: []
            },
            {
              name: 'Ruvuma',
              key: '0001',
              path: 'TZA/0001',
              children: []
            },
            {
              name: 'Singida',
              key: '0001',
              path: 'TZA/0001',
              children: []
            },
            {
              name: 'Tabora',
              key: '0001',
              path: 'TZA/0001',
              children: []
            },
            {
              name: 'Tanga',
              key: '0001',
              path: 'TZA/0001',
              children: []
            }
          ]
        }
      ]
    }
  ]
  ocha.createNavTree '#the_tree', data, 'Select Country'
  return
