

function pie(data) {
	
	data = data;	
	
	var width = 480,
    height = 250,
    radius = Math.min(width, height) / 2;

    // var width = 300,
    // height = 300,
    // radius = 100;

	var color = d3.scale.category10();

	var pie = d3.layout.pie()
	    .value(function(d) {return d.count; })
	    .sort(function(d) {return null;});

	var arc = d3.svg.arc()
	    .innerRadius(radius - 60)
	    .outerRadius(radius - 20);

	var key = function(d){ return d.fromUser; };

	var svg = d3.select("#numberOfPostsChartID").append("svg:svg")
	.data(data)
	    .attr("width", width)
	    .attr("height", height)
	  .append("svg:g")
	    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	// d3.json(data, function(error, data) {
	//   if (error) throw error;
	data.forEach(function(d) {
	  d.count = +d.count;
	  d.fromUser = d.fromUser;
	});

	  var path = svg
	   .datum(data)
	  .selectAll("g.slice")
	      .data(pie)
	    .enter()
	    .append("svg:g")
	    .attr("class", "slice");

	    path.append("svg:path")
	      .attr("fill", function(d, i) { return color(i); })
	      .attr("d", arc)
	      .each(function(d) { this._current = d; }); // store the initial angles
	
	// Add a legendLabel to each arc slice...
    path.append("svg:text")
      .attr("transform", function(d) { //set the label's origin to the center of the arc
        //we have to make sure to set these before calling arc.centroid
        d.outerRadius = radius + 50; // Set Outer Coordinate
        d.innerRadius = radius + 45; // Set Inner Coordinate
        return "translate(" + arc.centroid(d) + ")";
      })
      .attr("text-anchor", "middle") //center the text on it's origin
      .style("fill", "black")
      .style("font", "bold 12px Arial")
      .text(function(d, i) { return data[i].fromUser + ": " + data[i].count; });

	  d3.selectAll("input")
	      .on("change", change);

	  var timeout = setTimeout(function() {
	    d3.select("input[value=\"oranges\"]").property("checked", true).each(change);
	  }, 2000);

	  function change() {
	    var value = this.value;
	    clearTimeout(timeout);
	    pie.value(function(d) { return d[value]; }); // change the value function
	    path = path.data(pie); // compute the new angles
	    path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
	  }
	// });

	function change(data){
    path.data(pie(data));
    path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs

}

	function type(d) {
	console.log("d");
	console.log(d);
	  d.count = +d.count;
	  d.fromUser = [d.fromUser];
	  return d;
	}

	// Store the displayed angles in _current.
	// Then, interpolate from _current to the new angles.
	// During the transition, _current is updated in-place by d3.interpolate.
	function arcTween(a) {
	  var i = d3.interpolate(this._current, a);
	  this._current = i(0);
	  return function(t) {
	    return arc(i(t));
	  };
	}
}