function map(data){

    //delete old chart
    d3.select("#mapChartID").select("svg").remove();
    //update data
    data = data;

    //zoom function
    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 8])
        .on("zoom", move);

    //initalize map div
    var mapDiv = $("#mapChartID");

    //calculate the width and height dynamically based on map div and margins
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = mapDiv.width() - margin.right - margin.left,
        height = mapDiv.height() - margin.top - margin.bottom;

    //initialize color scale
    var color = d3.scale.category10();
 
    //initialize tooltip
    var div = d3.select("body").append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);

    //inizialize the projection
    var projection = d3.geo.mercator()
        .center([75, 50 ])
        .scale(150);

    //initialize the svg graphic
    var svg = d3.select("#mapChartID").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);

    //inizialize the path
    var path = d3.geo.path()
        .projection(projection);

    g = svg.append("g");

    // load data and draw the map
    d3.json("world-topo.topojson", function(error, world) {
        var countries = topojson.feature(world, world.objects.countries).features;        
        //draw the map
        draw(countries, data);
    });

/**
 * draw the map
 * @param countries: topojson
 * @param data
 */
    function draw(countries,data) {
        //add the countries from the topojson
        var country = g.selectAll(".country").data(countries);

        //initialize count property
        countries.forEach(function(c){
            c.properties.count = 0;
        })

        //initialize a color country object 
        var cc = {};
        //create the color array for all colors that are in the data and add count value
        data.forEach(function(d){
            cc[d["countryName"]] = d3.rgb("#008000");
            countries.forEach(function(c){
                if (c.properties.name == d.countryName) {
                    c.properties.count = d.count;
                }
            })
        })

        //add countries to the path and apply the colors
        country.enter().insert("path")
            .attr("class", "country")
            .attr("d", path)
            //country color
            .style("fill", function(d) {
                return cc[d.properties.name];
            })

            //tooltip
            .on("mousemove", function(d) {
                var mouse = d3.mouse(svg.node()).map(function(d) {
                        return parseInt(d);
                    });
                div.transition()        
                    .duration(200)      
                    .style("opacity", .9);      
                div .html(d.properties.name + ": " + d.properties.count)  
                    .style("left", (d3.event.pageX +1) + "px")     
                    .style("top", (d3.event.pageY-120) + "px");   
            })        
            .on("mouseout", function(d) {
                div.transition()        
                .duration(500)      
                .style("opacity", 0);    
            })
    }

    /**
     * zoom and panning method
     */
    function move() {
        var t = d3.event.translate;
        var s = d3.event.scale;

        zoom.translate(t);
        g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");

    }
}

