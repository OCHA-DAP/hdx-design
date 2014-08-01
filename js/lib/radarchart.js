//Practically all this code comes from https://github.com/alangrafu/radar-chart-d3
//I only made some additions and aesthetic adjustments to make the chart look better
//(of course, that is only my point of view)
//Such as a better placement of the titles at each line end,
//adding numbers that reflect what each circular level stands for
//Not placing the last level and slight differences in color
//
//For a bit of extra information check the blog about it:
//http://nbremer.blogspot.nl/2013/09/making-d3-radar-chart-look-bit-better.html

var RadarChart = {
  draw: function(id, d, options) {
    var cfg = {
      radius: 5,
      w: 600,
      h: 600,
      factor: 1.0,
      factorLegend: .85,
      levels: 5,
      maxValue: 0,
      radians: 2 * Math.PI,
      opacityArea: 0.5,
      ToRight: 5,
      TranslateX: 80,
      TranslateY: 30,
      ExtraWidthX: 150,
      ExtraWidthY: 150,
      color: d3.scale.category10()
    };

    if ('undefined' !== typeof options) {
      for (var i in options) {
        if ('undefined' !== typeof options[i]) {
          cfg[i] = options[i];
        }
      }
    }
    // cfg.maxValue = Math.max(cfg.maxValue, 1.08 * d3.max(d, function(i){return d3.max(i.map(function(o){return o.value;}))}));
    // var allAxis = (d[0].map(function(i, j){return i.axis}));
    cfg.maxValue = Math.max(cfg.maxValue, 1.08 * d3.max(d, function(set) {
      return d3.max(set.axes, function(o) {
        return o.value;
      });
    }));
    var allAxis = d[0].axes.map(function(i, j) {
      return i.axis;
    });
    var total = allAxis.length;
    var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
    var Format = d3.format(',');
    d3.select(id).select("svg").remove();

    var g = d3.select(id)
      .append("svg")
      .attr("width", cfg.w + cfg.ExtraWidthX)
      .attr("height", cfg.h + cfg.ExtraWidthY)
      .append("g")
      .attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");;

    var tooltip;

    //Circular segments
    for (var j = 0; j < cfg.levels - 1; j++) {
      var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
      g.selectAll(".levels")
        .data(allAxis)
        .enter()
        .append("svg:line")
        .attr("x1", function(d, i) {
          return levelFactor * (1.0 - cfg.factor * Math.sin(i * cfg.radians / total));
        })
        .attr("y1", function(d, i) {
          return levelFactor * (1.0 - cfg.factor * Math.cos(i * cfg.radians / total));
        })
        .attr("x2", function(d, i) {
          return levelFactor * (1.0 - cfg.factor * Math.sin((i + 1) * cfg.radians / total));
        })
        .attr("y2", function(d, i) {
          return levelFactor * (1.0 - cfg.factor * Math.cos((i + 1) * cfg.radians / total));
        })
        .attr("class", "line")
        .style("stroke", "grey")
        .style("stroke-opacity", "0.75")
        .style("stroke-width", "0.3px")
        .attr("transform", "translate(" + (cfg.w / 2.0 - levelFactor) + ", " + (cfg.h / 2.0 - levelFactor) + ")");
    }

    series = 0;

    var axis = g.selectAll(".axis")
      .data(allAxis)
      .enter()
      .append("g")
      .attr("class", "axis");

    axis.append("line")
      .attr("x1", cfg.w / 2.0)
      .attr("y1", cfg.h / 2.0)
      .attr("x2", function(d, i) {
        return cfg.w / 2.0 * (1.0 - cfg.factor * Math.sin(i * cfg.radians / total));
      })
      .attr("y2", function(d, i) {
        return cfg.h / 2.0 * (1.0 - cfg.factor * Math.cos(i * cfg.radians / total));
      })
      .attr("class", "line")
      .style("stroke", "grey")
      .style("stroke-width", "1px");

    axis.append("text")
      .attr("class", "legend")
      .text(function(d) {
        return d
      })
      .style("font-family", "sans-serif")
      .style("font-size", "11px")
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .attr("transform", function(d, i) {
        return "translate(0, -10)"
      })
      .attr("x", function(d, i) {
        return cfg.w / 2 * (1 - cfg.factorLegend * Math.sin(i * cfg.radians / total)) - 60 * Math.sin(i * cfg.radians / total);
      })
      .attr("y", function(d, i) {
        return cfg.h / 2 * (1 - Math.cos(i * cfg.radians / total)) - 20 * Math.cos(i * cfg.radians / total);
      });

    d.forEach(function(set) {
      var class_name = 'radar-' + set.key.replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '');
      dataValues = [];
      g.selectAll(".nodes")
        .data(set.axes, function(j, i) {
          dataValues.push([
            cfg.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total)),
            cfg.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total))
          ]);
        });
      dataValues.push(dataValues[0]);
      g.selectAll(".area")
        .data([dataValues])
        .enter()
        .append("polygon")
        .attr("class", class_name)
        .style("stroke-width", "2px")
        .style("stroke", cfg.color(series))
        .attr("points", function(d) {
          var str = "";
          for (var pti = 0; pti < d.length; pti++) {
            str = str + d[pti][0] + "," + d[pti][1] + " ";
          }
          return str;
        })
        .style("fill", function(j, i) {
          return cfg.color(series)
        })
        .style("fill-opacity", cfg.opacityArea)
        .on('mouseover', function(d) {
          z = "polygon." + d3.select(this).attr("class");
          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", 0.1);
          g.selectAll(z)
            .transition(200)
            .style("fill-opacity", .7);
        })
        .on('mouseout', function() {
          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", cfg.opacityArea);
        });
      series++;
    });
    series = 0;

    key_names = []
    d.forEach(function(set) {
      key_names.push(set.key);
      var class_name = 'radar-' + set.key.replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '');
      g.selectAll(".nodes")
        .data(set.axes).enter()
        .append("svg:circle")
        .attr("class", class_name)
        .attr('r', cfg.radius)
        .attr("alt", function(j) {
          return Math.max(j.value, 0)
        })
        .attr("cx", function(j, i) {
          dataValues.push([
            cfg.w / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total)),
            cfg.h / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total))
          ]);
          return cfg.w / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.sin(i * cfg.radians / total));
        })
        .attr("cy", function(j, i) {
          return cfg.h / 2 * (1 - (Math.max(j.value, 0) / cfg.maxValue) * cfg.factor * Math.cos(i * cfg.radians / total));
        })
        .attr("data-id", function(j) {
          return j.axis
        })
        .style("fill", cfg.color(series)).style("fill-opacity", .9)
        .on('mouseover', function(d) {
          newX = parseInt(d3.select(this).attr('cx')) - 40 + cfg.TranslateX;
          newY = parseInt(d3.select(this).attr('cy')) - 60 + cfg.TranslateY;
          tooltip
            .style('opacity', 1)
            .style('top', newY + 'px')
            .style('left', newX + 'px')
            .text(Format(d.value))
          // tooltip
          // 	.attr('x', newX)
          // 	.attr('y', newY)
          // 	.text(Format(d.value))
          // 	.transition(200)
          // 	.style('opacity', 1);

          z = "polygon." + d3.select(this).attr("class");
          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", 0.1);
          g.selectAll(z)
            .transition(200)
            .style("fill-opacity", cfg.opacityArea);
        })
        .on('mouseout', function() {
          tooltip
            .transition(200)
            .style('opacity', 0);
          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", cfg.opacityArea);
        })
        .append("svg:title")
        .text(function(j) {
          return Math.max(j.value, 0)
        });

      series++;
    });
    //Tooltip
    tooltip = d3.select(id)
      .append("div")
      .attr('class', 'radar-tooltip')
      .style("position", "absolute")
      .style("z-index", "10")
      .style("opacity", 0)
    // tooltip = g.append('text')
    // 		   .style('opacity', 0)
    // 		   .style('font-family', 'sans-serif')
    // 		   .style('font-size', '13px');

    // Legend

    var svg = d3.select(id).select('svg')
    var legends = svg.append('g').attr('class', 'legend-group')
    var legend_index = 0;
    var legend_length = 0
    var legend_items = []
    key_names.forEach(function(k){
      var class_name = k.replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '');
      var legend_item = legends.append('g')
        .attr('class', 'legend-item ' + class_name)
        .on('mouseover', function(){
          d3.selectAll('.legend-item').transition(200).style('fill-opacity', 0.2);
          d3.select(this).transition(200).style("fill-opacity", 1);
          g.selectAll("polygon")
            .transition(200)
            .style("fill-opacity", 0.1);
          g.selectAll('polygon.radar-'+class_name)
            .transition(200)
            .style("fill-opacity", cfg.opacityArea);
        })
        .on('mouseout', function(){
          d3.selectAll('.legend-item').transition(200).style('fill-opacity', 1);
        g.selectAll("polygon")
          .transition(200)
          .style("fill-opacity", cfg.opacityArea);
        })
      legend_item.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('x', 0)
        .attr('y', 0)
        .style('fill', cfg.color(legend_index))
      var legend_item_text = legend_item.append('text')
        .attr('x', 15)
        .attr('y', 9)
        .text(k);
      legend_length = legend_length + 15 + parseInt(legend_item_text.style('width').replace('px',''));
      legend_items.push(legend_item);
      legend_index++;
    });
    legend_length = legend_length + (key_names.length - 1)*25;
    var offsetX = cfg.TranslateX + (cfg.w - legend_length)/2;
    var offsetY = cfg.TranslateY + cfg.h + 5;
    legends.attr("transform", "translate(" + offsetX + "," + offsetY + ")")
    offsetX = 0;
    legend_items.forEach(function(one){
      one.attr("transform", "translate(" + offsetX + ", 0)");
      offsetX = offsetX + parseInt(one.select('text').style('width').replace('px','')) + 40;
    });
  }
};
