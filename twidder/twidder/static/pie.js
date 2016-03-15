var width = 250,
    height = 250,
    radius = Math.min(width, height) / 2;


//PIE CHART FOR POSTS
function piePosts(data) {
	//delete old chart
	d3.select("#numberOfPostsChartID").select("svg").remove();
	//color scale
	var color = d3.scale.category10();
	//update data
	data = data;
	//d3 pie chart
	var pie = d3.layout.pie()
	    .value(function(d) {return d.count; })
	    .sort(function(d) {return null;});
	//set inner and outer radius of the arc
	var arc = d3.svg.arc()
	    .innerRadius(radius - 60)
	    .outerRadius(radius - 20);
	//svg graphic in the div
	var svg = d3.select("#numberOfPostsChartID").append("svg:svg")
	.data(data)
	    .attr("width", width)
	    .attr("height", height)
	  .append("svg:g")
	    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	//get data values for each item
	data.forEach(function(d) {
	  d.count = +d.count;
	  d.fromUser = d.fromUser;
	});

	//arc slices
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
	
	// label for each slice
    path.append("svg:text")
      .attr("transform", function(d) { //set the label's origin to the center of the arc
        d.outerRadius = radius + 50; // Set Outer Coordinate
        d.innerRadius = radius + 45; // Set Inner Coordinate
        return "translate(" + arc.centroid(d) + ")";
      })
      .attr("text-anchor", "middle") //center the text
      .style("fill", "black")
      .style("font", "bold 12px Arial")
      .text(function(d, i) { return data[i].fromUser + ": " + data[i].count; }); //label text
}

//PIE CHART FOR THE CURRENT ONLINE USERS
function pieUsers(data) {
	//delete old chart
	d3.select("#currentUsersOnlineChartID").select("svg").remove();
	//update data
	data = data;
	//color range
	var color = d3.scale.category10()
		.range([d3.rgb("#24a221"), d3.rgb('#d8241f')]); //green, red

	//init pie chart
	var pie = d3.layout.pie()
	    .value(function(d) {return d.count; })
	    .sort(function(d) {return null;});
	//set inner and outer radius of arc
	var arc = d3.svg.arc()
	    .innerRadius(radius - 60)
	    .outerRadius(radius - 20);
	//svg graphic in div tag
	var svg = d3.select("#currentUsersOnlineChartID").append("svg:svg")
		.data(data)
	    .attr("width", width)
	    .attr("height", height)
	  	.append("svg:g")
	    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
	//get each data item
	data.forEach(function(d) {
		d.count = +d.count; //number
	});
	//arc slice
	var path = svg
	   	.datum(data)
	  	.selectAll("g.slice")
	    .data(pie)
	    .enter()
	    .append("svg:g")
	    .attr("class", "slice");
	    //color the slices
	    path.append("svg:path")
	      .attr("fill", function(d, i) { return color(i); })
	      .attr("d", arc)
	      .each(function(d) { this._current = d; }); // store the initial angles
	
	// Add a label text
    path.append("svg:text")
      .attr("transform", function(d) {
        //set radius
        d.outerRadius = radius + 50; // Set Outer Coordinate
        d.innerRadius = radius + 45; // Set Inner Coordinate
        return "translate(" + arc.centroid(d) + ")";
      })
      .attr("text-anchor", "middle") //center the text on it's origin
      .style("fill", "black")
      .style("font", "bold 12px Arial")
      .text(function(d, i) { return data[i].count + " " + data[i].status; }); //label text
}