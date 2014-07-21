(function() {
  $(document).ready(function() {
    var all_links, diagonal, height, highlight, highlightLink, index, indicators, link_layer, links, mapID, margin, node, nodes, openURL, regions, root, svg, timestamps, tree, width, _i, _len;
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
    width = 960 - margin.left - margin.right;
    height = 960 - margin.top - margin.bottom;
    tree = d3.layout.tree().size([height, width]);
    diagonal = d3.svg.diagonal().projection(function(d) {
      return [d.y, d.x];
    });
    svg = d3.select('#content').append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr('transform', "translate(" + margin.left + ", " + margin.top + ")");
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
    regions.append('text').attr('x', 6).attr('dy', '.35em').attr('text-anchor', 'front').text(function(d) {
      return d.name;
    });
    regions.on('mouseover', function(d) {
      return highlight(d);
    }).on('mouseout', function(d) {
      return highlight(null);
    }).on('mouseup', function(d) {
      return openURL(d.url);
    });
    highlight = function(d) {
      if (d !== null) {
        return highlightLink(d);
      } else {
        return all_links.style('stroke', '#ddd');
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
    openURL = function(url) {
      return window.open(url, '_blank').focus();
    };
  });

}).call(this);
