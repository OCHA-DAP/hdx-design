require ['js/ocha.js'], (ocha)->

  ocha.createPieChart '#pie_chart_1', 'Sample Data', 'percentage', [{'Kenya': 24}]
  ocha.createPieChart '#pie_chart_m', 'Sample Data', 'percentage', [{'Kenya': 24},{'Columbia': 10},{'Brazil': 4}]

  people_data =
    '2000': [{'Refugees': 12129572}, {'Asylum seekers': 947926}]
    '2001': [{'Refugees': 12116835}, {'Asylum seekers': 943854}]
    '2002': [{'Refugees': 10594055}, {'Asylum seekers': null}]
    '2003': [{'Refugees': 9592795}, {'Asylum seekers': null}]
    '2004': [{'Refugees': 9568144}, {'Asylum seekers': 885249}]
    '2005': [{'Refugees': 8661988}, {'Asylum seekers': 802174}]
    '2006': [{'Refugees': 9877703}, {'Asylum seekers': 741291}]
    '2007': [{'Refugees': 11390930}, {'Asylum seekers': 741110}]
    '2008': [{'Refugees': 10489812}, {'Asylum seekers': 825043}]

  food_data =
    'Benin': [{'Poor': 5}, {'Borderline': 18}]
    'Burundi': [{'Poor': 4.8}, {'Borderline': 22.9}]
    'Cameroon': [{'Poor': 9}, {'Borderline': 17}]
    'Chad': [{'Poor': 16.4}, {'Borderline': 25}]
    'Congo': [{'Poor': 6.4}, {'Borderline': 30}]
    'Ethiopia': [{'Poor': 9.5}, {'Borderline': 16.6}]
    'Ghana': [{'Poor': 1.6}, {'Borderline': 3.8}]
    'Guinea': [{'Poor': 8.4}, {'Borderline': 23.7}]
    'Haiti': [{'Poor': 5.9}, {'Borderline': 19.1}]
    'Laos': [{'Poor': 2}, {'Borderline': 11}]
    'Madagascar': [{'Poor': 11.9}, {'Borderline': 41.2}]
    'Mozambique': [{'Poor': 9.1}, {'Borderline': 18.3}]
    'Rwanda': [{'Poor': 4}, {'Borderline': 17}]
  ocha.createLineChart '#line_chart', 'People in need', 'UNHCR', people_data, 'Count'
  ocha.createBarChart '#bar_chart', 'People in need', 'UNHCR', food_data, '% of households'

  people_disaters_data =
    'Afghanistan': {'Disasters': [1,3,5,2,4,5,1,3,5,6,3,2,5,4,3], 'People In Need': [2183376,2669907,4931460,4719807,5821096,5077223,2565772,2631740,3589846,5821096,4314459]}
    'Columbia': {'Disasters': [1,3,2,3,2,5,8,2,2,5,3,1,1,0,1], 'People In Need': [11178682,1278645,1667607,5496767,1673912,1604307,830039,1150627,1373770, 2744021,1229886,1044160,1013355,864034]}
    'YEM': {'Disasters': [0,1,1,0,0,0,1,0,1,2,0,0,0,0,0], 'People In Need':[682458,736136,245499,403099,276198, 0, 75632, 0,12518, 0,0,0,0,0,0]}
  ocha.createScatterPlotChart '#scatter_plot_chart', 'Disasters VS People in need', '', people_disaters_data, 'Count', 'Count'

  radar_data = [
    {
      key: 'Columbia',
      axes: [
        {axis: "overweight", value: 128645},
        {axis: "stunted", value: 403099},
        {axis: "wasted", value: 163912},
        {axis: "underweight", value: 276198},
        {axis: "with fever", value: 414459}
      ]
    },
    {
      key: 'Kenya',
      axes: [
          {axis: "overweight", value: 173636},
          {axis: "stunted", value: 175632},
          {axis: "wasted", value: 250483},
          {axis: "underweight", value: 200839},
          {axis: "with fever", value: 312518}
      ]
    }
  ]
  ocha.createRadarChart '#radar_chart', 'Cross-Appeal: Amount Received By', '2012', radar_data, 'USD'

  map_graphc = ocha.createMapGraph 'map'

  $.getJSON 'data/demo-tree.json', (data)->
    ocha.createNavTree '#the_tree', data, 'Select Country'

  $.getJSON 'data/demo-countries.json', (data)->
    $one_filter_group =$("<div class='filter-group'><label>Location</label></div>").appendTo $('#filter_container')
    one_dropdown = ocha.createDropdown data, 'Any location'
    one_dropdown.appendTo $one_filter_group
    .on 'typeahead:selected', (event, item)->
      console.log item.value

    $one_filter_group =$("<div class='filter-group'><label>Format</label></div>").appendTo $('#filter_container')
    one_dropdown = ocha.createDropdown ['XSL', 'CSV', 'TXT', 'PDF'], 'Any format'
    one_dropdown.appendTo $one_filter_group

    $one_filter_group =$("<div class='filter-group'><label>Topic</label></div>").appendTo $('#filter_container')
    one_dropdown = ocha.createDropdown ['Health', 'Logistics', 'Food', 'Nutrition'], 'Any topic'
    one_dropdown.appendTo $one_filter_group

    $one_filter_group =$("<div class='filter-group'><label>License</label></div>").appendTo $('#filter_container')
    one_dropdown = ocha.createDropdown ['License 1', 'License 2', 'License 3', 'Lisense 4'], 'Any license'
    one_dropdown.appendTo $one_filter_group

    $one_filter_group =$("<div class='filter-group'><label>Organization</label></div>").appendTo $('#filter_container')
    one_dropdown = ocha.createDropdown ['Organization 1', 'Organization 2', 'Organization 3', 'Organization 4'], 'Any organization'
    one_dropdown.appendTo $one_filter_group

    $one_filter_group =$("<div class='filter-group'><label>Language</label></div>").appendTo $('#filter_container')
    one_dropdown = ocha.createDropdown ['Language 1', 'Language 2', 'Language 3', 'Language 4'], 'Any language'
    one_dropdown.appendTo $one_filter_group
  $("#search_filter_btn").click ()->
    if $("#search_filter_btn span").text() == '+'
      $("#search_bar_content").slideDown 300, ()->
        $("#search_filter_btn span").text('-')
    else
      $("#search_bar_content").slideUp 300, ()->
        $("#search_filter_btn span").text('+')
  return
