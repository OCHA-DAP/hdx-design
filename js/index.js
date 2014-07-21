(function() {
  $(document).ready(function() {
    var all_links, charts, d, diagonal, height, highlight, highlightLink, i, index, indicators, k, legend, legend_data, link_layer, links, mapID, margin, node, nodes, o, one, one_legend, one_region, openURL, options, regions, root, svg, timestamps, tree, v, width, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
    mapID = 'xyfeng.ijpo6lio';
    d3.selection.prototype.moveToFront = function() {
      return this.each(function() {
        return this.parentNode.appendChild(this);
      });
    };
    margin = {
      top: 40,
      right: 40,
      bottom: 40,
      left: 80
    };
    width = 1200 - margin.left - margin.right;
    height = 960 - margin.top - margin.bottom;
    tree = d3.layout.tree().size([height, width]);
    diagonal = d3.svg.diagonal().projection(function(d) {
      return [d.y, d.x];
    });
    svg = d3.select('#content').append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', "translate(" + margin.left + ", " + margin.top + ")");
    svg.append('text').attr('class', 'label').attr('x', 815).attr('y', 5).text('RECOMMEND');
    svg.append('text').attr('class', 'label').attr('x', 900).attr('y', 5).text('OPTIONS');
    legend_data = {
      B: 'Bar',
      L: 'Line',
      M: 'Map',
      P: 'Pie',
      R: 'Radar',
      S: 'Scatter Plot'
    };
    legend = svg.append('g');
    i = 0;
    for (k in legend_data) {
      v = legend_data[k];
      i += 1;
      one_legend = legend.append('g');
      one_legend.append('rect').attr('class', "option-box " + k).attr('x', -40).attr('y', 640 + i * 30).attr('width', 20).attr('height', 20);
      one_legend.append('text').attr('class', 'option-text').attr('x', -30).attr('y', 655 + i * 30).attr('text-anchor', 'middle').text(k);
      one_legend.append('text').attr('class', 'option-label').attr('x', -10).attr('y', 655 + i * 30).text(v);
    }
    nodes = tree.nodes(index_json);
    links = tree.links(nodes);
    for (index = _i = 0, _len = nodes.length; _i < _len; index = ++_i) {
      node = nodes[index];
      node.y = node.depth * 240;
      node.code = "node_" + index;
    }
    link_layer = svg.append('g').attr('class', 'link-layer');
    all_links = link_layer.selectAll(".link").data(links).enter().append("path").attr("class", "link").attr("d", diagonal).attr("id", function(d) {
      return "link_" + d.source.code + "_" + d.target.code;
    }).style('stroke-width', 12).style('stroke', '#ddd');
    svg.selectAll(".node").data(nodes).enter().append("g").attr("class", function(d) {
      return "" + d.type;
    }).attr("transform", function(d) {
      return "translate(" + d.y + "," + d.x + ")";
    });
    root = svg.select('.root');
    indicators = svg.selectAll('.indicator');
    timestamps = svg.selectAll('.timestamp');
    regions = svg.selectAll('.region');
    root.append('circle').attr('r', 45).attr('fill', '#F37F8D');
    root.append('text').attr('fill', '#fff').attr('dy', '.35em').attr('text-anchor', 'middle').style('font-weight', '500').text(function(d) {
      return d.name;
    });
    indicators.append('circle').attr('r', 30).attr('fill', '#F5A623');
    indicators.append('text').attr('fill', '#fff').attr('dy', '.35em').attr('text-anchor', 'middle').style('font-weight', '500').text(function(d) {
      return d.name;
    });
    indicators.append('text').attr('y', 45).attr('fill', '#999').attr('dy', '.35em').attr('text-anchor', 'middle').text(function(d) {
      if (d.name === 'One') {
        return 'indicator';
      } else {
        return 'indicators';
      }
    });
    timestamps.append('circle').attr('r', 30).attr('fill', '#4A90E2');
    timestamps.append('text').attr('fill', '#fff').attr('dy', '.35em').attr('text-anchor', 'middle').style('font-weight', '500').text(function(d) {
      return d.name;
    });
    timestamps.append('text').attr('y', 45).attr('fill', '#999').attr('dy', '.35em').attr('text-anchor', 'middle').text(function(d) {
      if (d.name === 'One') {
        return 'timestamp';
      } else {
        return 'timestamps';
      }
    });
    _ref = regions[0];
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      one = _ref[_j];
      d = one.__data__;
      one_region = d3.select(one);
      one_region.attr('id', d.code);
      one_region.append('text').attr('x', 6).attr('dy', '.35em').attr('text-anchor', 'front').text(function(d) {
        return d.name;
      });
      charts = one_region.append('g').attr('class', 'charts');
      charts.append('rect').attr('class', "option-box " + d.recommend).attr('x', 115).attr('y', -10).attr('width', 20).attr('height', 20);
      charts.append('text').attr('class', 'option-text').attr('x', 125).attr('dy', 5).attr('text-anchor', 'middle').text(d.recommend);
      options = charts.append('g').attr('class', 'options').style('opacity', 0);
      _ref1 = d.options;
      for (i = _k = 0, _len2 = _ref1.length; _k < _len2; i = ++_k) {
        o = _ref1[i];
        options.append('rect').attr('class', "option-box " + o).attr('x', 180 + i * 30).attr('y', -10).attr('width', 20).attr('height', 20);
        options.append('text').attr('class', 'option-text').attr('x', 190 + i * 30).attr('dy', 5).attr('text-anchor', 'middle').text(o);
      }
      one_region.on('mouseover', function(d) {
        return highlight(d);
      }).on('mouseout', function(d) {
        return highlight(null);
      }).on('mouseup', function(d) {
        return openURL(d.url);
      });
    }
    highlight = function(d) {
      if (d !== null) {
        highlightLink(d);
        return d3.select("#" + d.code + " .options").style('opacity', 1);
      } else {
        all_links.style('stroke', '#ddd');
        return d3.selectAll(".options").style('opacity', 0);
      }
    };
    highlightLink = function(d) {
      var link;
      if (d.parent) {
        link = svg.select("#link_" + d.parent.code + "_" + d.code);
        link.moveToFront(root);
        link.style('stroke', '#50DA9B');
        return highlightLink(d.parent);
      }
    };
    openURL = function(url) {};
  });

}).call(this);
