require ['js/ocha.js'], (ocha)->
  $.getJSON 'data/demo-countries.json', (data)->
    $country_filter = $('#country_filter select')
    for one in data
      $("<option value='#{one}'>#{one}</option>").appendTo $country_filter
    $('.combobox').combobox()
  $("#search_filter_btn").click ()->
    if $("#search_filter_btn span").text() == '+'
      $("#search_bar_content").slideDown 300, ()->
        $("#search_filter_btn span").text('-')
    else
      $("#search_bar_content").slideUp 300, ()->
        $("#search_filter_btn span").text('+')
  return
