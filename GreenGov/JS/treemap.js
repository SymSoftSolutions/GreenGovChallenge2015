// var Data2013Url = 'https://greengov.data.ca.gov/resource/hryn-vhph.json';
// var Data2014Url = 'https://greengov.data.ca.gov/resource/24pi-kxxa.json';
var DeparmentThenPropType = 'https://greengov.data.ca.gov/resource/wikn-9ft8.json';

var BuildingMetrics2013 = 'JS/Metrics__2013_.csv'
// TODO
var BuildingMetrics2014 = ''

/*
Go from Deparments-> Property -> Values
 */

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [
    , ""
  ])[1].replace(/\+/g, '%20')) || null
}


// FOR Testing
var deparmentName = getURLParameter('acronym')  || 'CDCR';

var wantedValue = 'Natural Gas Use (therms)';
// var wantedValue = 'Water Use (All Water Sources) (kgal)';
var margin = {
    top: 20,
    right: 0,
    bottom: 0,
    left: 0
  },
  width = document.querySelector('#attach')
    .clientWidth,
  // height = width /1.2  - margin.top - margin.bottom,
  height = document.querySelector('#attach')
    .clientHeight,
  formatNumber = d3.format(",d"),
  transitioning;

var colors = [
  "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#006837", "#004529"
];
// var color = d3.scale.category20c();

var colorStart = 0;

var color = d3.scale.ordinal().range(colors);
// var color = function (i) {
//   return colors[(i % colors.length)]
// }

var x = d3.scale
  .linear()
  .domain([0, width])
  .range([0, width]);

var y = d3.scale
  .linear()
  .domain([0, height])
  .range([0, height]);

var treemap = d3.layout
  .treemap()
  .children(function (d, depth) {
    return depth
      ? null
      : d._children;
  })
  .sort(function (a, b) {
    return a.value - b.value;
  })
  .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
  .round(false);

var svg = d3.select("#attach")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.bottom + margin.top)
  .style("margin-left", -margin.left + "px")
  .style("margin.right", -margin.right + "px")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .style("shape-rendering", "crispEdges");

var grandparent = svg.append("g")
  .attr("class", "grandparent");

grandparent.append("rect")
  .attr("y", -margin.top)
  .attr("width", width)
  .attr("height", margin.top);

grandparent.append("text")
  .attr("x", 6)
  .attr("y", 6 - margin.top)
  .attr("dy", ".75em");
/*
{
 "name": "flare",
 "children": [
  {
   "name": "analytics",
   "children": [
    {
     "name": "cluster",
     "children": [
      {"name": "AgglomerativeCluster", "value": 3938},
      {"name": "CommunityStructure", "value": 3812},
      {"name": "HierarchicalCluster", "value": 6714},
      {"name": "MergeEdge", "value": 743}
     ]
    },
    {
     "name": "graph",
     "children": [
      {"name": "BetweennessCentrality", "value": 3534},
      {"name": "LinkDistance", "value": 5731},
      {"name": "MaxFlowMinCut", "value": 7840},
      {"name": "ShortestPaths", "value": 5914},
      {"name": "SpanningTree", "value": 3416}
     ]
    },

{
  avg_percent_of_electricity_that_is_green_power: "0.00000000000000000000"
  avg_site_energy_use_kbtu: "3296471.6"
  department_name: "California African American Museum"
  primary_property_type_self_selected: "Other - Services"
}
 */

function isNumeric(n) {
  // return !isNaN(parseFloat(n)) && isFinite(n);
  return !isNaN(n);
}


var savedCsv;
d3.csv(BuildingMetrics2013, function(csv) {
  savedCsv = csv;
  createMap(csv);
});

function WaterUsage() {
  wantedValue = 'Water Use (All Water Sources) (kgal)';
createMap(savedCsv)
}

function createMap(root) {


    var root = convert(root, wantedValue);
    //
    initialize(root);
    accumulate(root);
    layout(root);
    display(root);

    function initialize(root) {
      root.x = root.y = 0;
      root.dx = width;
      root.dy = height;
      root.depth = 0;
    }

    // Aggregate the values for internal nodes. This is normally done by the
    // treemap layout, but not here because of our custom implementation.
    // We also take a snapshot of the original children (_children) to avoid
    // the children being overwritten when when layout is computed.
    function accumulate(d) {
      return (d._children = d.children)
        ? d.value = d
          .children
          .reduce(function (p, v) {
            return p + accumulate(v);
          }, 0)
        : d.value;
    }

    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1×1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent’s dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    function layout(d) {
      if (d._children) {
        treemap.nodes({
          _children: d._children
        });
        d
          ._children
          .forEach(function (c) {
            c.x = d.x + c.x * d.dx;
            c.y = d.y + c.y * d.dy;
            c.dx *= d.dx;
            c.dy *= d.dy;
            c.parent = d;
            layout(c);
          });
      }
    }

    function display(d) {
      grandparent.datum(d.parent)
        .on("click", transition)
        .select("text")
        .text("↩ " + name(d));

      var g1 = svg.insert("g", ".grandparent")
        .datum(d)
        .attr("class", "depth");

      var g = g1.selectAll("g")
        .data(d._children)
        .enter()
        .append("g");

      g.filter(function (d) {
          return d._children;
        })
        .classed("children", true)
        .on("click", transition);

      g.selectAll(".child")
        .data(function (d) {
          return d._children || [d];
        })
        .enter()
        .append("rect")
        .attr("class", "child")
        .call(rect);

      g.append("rect")
        .attr("class", "parent")
        .call(rect)
        .append("title")
        .text(function (d) {
          return formatNumber(d.value);
        });

      g.append("text")
        .attr("dy", ".75em")
        .text(textName)
        .call(text);

      g.append("title")
        .text(textName)

      // g.append( "text" )
      //   .attr( "dy", ".75em" )
      //   .text( function ( d ) {
      //     return d.value.toFixed(2);
      //   } )
      //   .call( text2 );

      g.selectAll("rect.parent")
        .style("fill", function (d,i) {
          console.log(d.area);
          return color(d.area);
        });

      function transition(d) {
        if (transitioning || !d)
          return;
        transitioning = true;

        var g2 = display(d),
          t1 = g1.transition()
            .duration(750),
          t2 = g2.transition()
            .duration(750);

        // Update the domain only after entering new elements.
        x.domain([
          d.x, d.x + d.dx
        ]);
        y.domain([
          d.y, d.y + d.dy
        ]);

        // Enable anti-aliasing during the transition.
        svg.style("shape-rendering", null);

        // Draw child nodes on top of parent nodes.
        svg
          .selectAll(".depth")
          .sort(function (a, b) {
            return a.depth - b.depth;
          });

        // Fade-in entering text.
        g2.selectAll("text")
          .style("fill-opacity", 0);

        // Transition to the new view.
        t1.selectAll("text")
          .call(text)
          .style("fill-opacity", 0);
        t2.selectAll("text")
          .call(text)
          .style("fill-opacity", 1);
        t1.selectAll("rect")
          .call(rect);
        t2.selectAll("rect")
          .call(rect);

        // Remove the old node when the transition is finished.
        t1
          .remove()
          .each("end", function () {
            svg.style("shape-rendering", "crispEdges");
            transitioning = false;
          });
      }

      return g;
    }

    function textName(d) {
      return d.name + ' ' + (d.value / 1000 * totalValue ).toFixed(1) + 'k';
    }

    function text(text) {
      text
        .attr("x", function (d) {
          return x(d.x) + 6;
        })
        .attr("y", function (d) {
          return y(d.y) + 6;
        })
        .style("opacity", function (d) {
          return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x)
            ? 1
            : 0;
        })

      //     text.each(function() {
      //       var text = d3.select(this),
      //           words = text.text().split(/\s+/).reverse(),
      //           word,
      //           line = [],
      //           lineNumber = 0,
      //           lineHeight = 1.1, // ems
      //           y = text.attr("y"),
      //           dy = parseFloat(text.attr("dy")),
      //           tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      //       while (word = words.pop()) {
      //         line.push(word);
      //         tspan.text(line.join(" "));
      //         if (tspan.node().getComputedTextLength() > width) {
      //           line.pop();
      //           tspan.text(line.join(" "));
      //           line = [word];
      //           tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      //         }
      //       }
      // })
    }

    function text2(text) {
      text
        .attr("x", function (d) {
          return x(d.x) + + 20;
        })
        .attr("y", function (d) {
          return y(d.y) + 20;
        });
    }

    function rect(rect) {
      rect
        .attr("x", function (d) {
          return x(d.x);
        })
        .attr("y", function (d) {
          return y(d.y);
        })
        .attr("width", function (d) {
          return x(d.x + d.dx) - x(d.x);
        })
        .attr("height", function (d) {
          return y(d.y + d.dy) - y(d.y);
        });
    }

    function name(d) {
      return d.parent
        ? name(d.parent) + " ↩  " + d.name
        : d.name;
    }


var totalValue = 0;

function convert(root, wantedValue) {

  // Get only this deparment
  root = root
    .filter(function (d) {
      return d['Department'] == deparmentName;
    })

  // Get total values
  totalValue = root
    .reduce(function (pv, d) {
      var value = Number.parseFloat(d[wantedValue])
      if (isNumeric(value)) {
        return pv + value;
      } else {
        return pv
      }
    }, 0)

  // console.log(root);

  var nest = d3
    .nest()
    .key(function (d) {
      return d['Primary Property Type - Self Selected'];
    })
    .key(function (d) {
      return d['Property Name']
    })
    .entries(root);

  // console.log(nest);
  var newNest = {

    "name": "California State Deparments",
    "children": nest
      .map(function (propType) {

        return {
          "name": propType.key,
          "children": propType
            .values
            .map(function (location) {
              var value = Number.parseFloat(location.values[0][wantedValue])
              value = value / totalValue;

              return {
                "name": location.key,
                "value": value
              };
            })
            .filter(function (d) {
              return isNumeric(d.value);
            })
        };
      })
  };
  return newNest
}

  }
