let margin = {top: 100, right: 100, bottom: 100, left: 100};

let width = 1000,
    height = 850,
    padding = 1.5, // separation between same-color circles
    clusterPadding = 5, // separation between different-color circles
    maxRadius = height*0.1;

let n = 40, // total number of nodes
    m = 5, // number of distinct clusters
//    z = d3.scaleOrdinal()
//      .domain(["German", "French", "Polish", "American", "Spanish"])
//      .range(["#ff9587", "#7FDBFF", "#39CCCC", "#bad63e", "#f2f070"])
   fillColour = d3.scaleOrdinal()
      .domain(["German", "Swiss","French", "Polish", "American", "Spanish", "Belorussian", "Chilean"])
      .range(["#ff9587", "#f1d9e7","#7FDBFF", "#39CCCC", "#bad63e", "#f2f070", "#a0aefd", "#53aefd"]);

let clusters = new Array(m);

let svg = d3.select('body')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

// Define the div for the tooltip
let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//load college major data
d3.csv("Count_Person.csv", function(d){
  let radiusScale = d3.scaleLinear()
    .domain(d3.extent(d, function(d) { return +d.Count;} ))
    .range([47, 95]);

console.log(radiusScale(300000));

  let nodes = d.map((d) => {
    // scale radius to fit on the screen
    let scaledRadius  = radiusScale(+d.Count),
        //  x:  Math.random() * 900,
        //  y: Math.random() * 800,
        forcedCluster = d.Nationality;

    // add cluster id and radius to array
    d = {
      cluster     : forcedCluster,
      r           : scaledRadius,
      name        : d.Name,
      category    : d.Nationality,
      bio         : d.Bio
    };
    // add to clusters array if it doesn't exist or the radius is larger than another radius in the cluster
    if (!clusters[forcedCluster] || (scaledRadius > clusters[forcedCluster].r)) clusters[forcedCluster] = d;

    return d;
  });


  // append the circles to svg then style
  // add functions for interaction
  let circles = svg.append('g')
        .datum(nodes)
      .selectAll('.circle')
        .data(d => d)
      .enter().append('circle')
        .attr('r', (d) => d.r)
        .attr('fill', (d) => fillColour(d.cluster))
        .attr('stroke', 'black')
        .attr('stroke-width', 1)

        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        // add tooltips to each circle
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div .html( "Nationality: " + d.category+ "<br/>Bio: " + d.bio )
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

  let texts = svg.append('g')
          .datum(nodes)
          .selectAll('.circle')
            .data(d => d)
          .enter()
          .append('text')
          .text(d => d.name)
          .attr("dy", ".3em")
          .style("text-anchor", "middle")
          .attr('color', 'black')
          .attr('font-size', 12)

  // create the clustering/collision force simulation
  let simulation = d3.forceSimulation(nodes)
      .velocityDecay(0.2)
      .force("x", d3.forceX().strength(.0005))
      .force("y", d3.forceY().strength(.0005))
      .force("collide", collide)
      .force("cluster", clustering)
      .on("tick", ticked);

  function ticked() {
      circles
          .attr('cx', (d) => d.x)
          .attr('cy', (d) => d.y);

       texts.attr('x', (d) => {
           return d.x
       })
           .attr('y', (d) => {
           return d.y
       });
  }

  // Drag functions used for interactivity
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  // These are implementations of the custom forces.
  function clustering(alpha) {
      nodes.forEach(function(d) {
        var cluster = clusters[d.cluster];
        if (cluster === d) return;
        var x = d.x - cluster.x,
            y = d.y - cluster.y,
            l = Math.sqrt(x * x + y * y),
            r = d.r + cluster.r;
        if (l !== r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          cluster.x += x;
          cluster.y += y;
        }
      });
  }

  function collide(alpha) {
    var quadtree = d3.quadtree()
        .x((d) => d.x)
        .y((d) => d.y)
        .addAll(nodes);

    nodes.forEach(function(d) {
      var r = d.r + maxRadius + Math.max(padding, clusterPadding),
          nx1 = d.x - r,
          nx2 = d.x + r,
          ny1 = d.y - r,
          ny2 = d.y + r;
      quadtree.visit(function(quad, x1, y1, x2, y2) {

        if (quad.data && (quad.data !== d)) {
          var x = d.x - quad.data.x,
              y = d.y - quad.data.y,
              l = Math.sqrt(x * x + y * y),
              r = d.r + quad.data.r + (d.cluster === quad.data.cluster ? padding : clusterPadding);
          if (l < r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.data.x += x;
            quad.data.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    });
  }


});
