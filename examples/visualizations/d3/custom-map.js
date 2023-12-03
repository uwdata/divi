function createMap() {
    //Width and height of map
    var width = 960;
    var height = 500;

    // D3 Projection
    var projection = d3.geoAlbersUsa()
                    .translate([width/2, height/2])    // translate to center of screen
                    .scale([1000]);          // scale things down so see entire US
            
    // Define path generator
    var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
                .projection(projection);  // tell path generator to use albersUsa projection

            
    // Define linear scale for output
    var color = d3.scaleLinear()
                .range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);

    var legendText = ["Cities Lived", "States Lived", "States Visited", "Nada"];

    //Create SVG element and append map to the SVG
    var svg = d3.select("#map")
                .append("svg")
                .attr("id", "mapsvg")
                .attr("width", width)
                .attr("height", height);
            
    // Append Div for tooltip to SVG
    // var div = d3.select("body")
    //             .append("div")   
    //             .attr("class", "tooltip")               
    //             .style("opacity", 0);

    // Load in my states data!
    d3.csv("https://raw.githubusercontent.com/Luke-S-Snyder/divi/main/examples/data/stateslived.csv").then(function(data) {
        color.domain([0,1,2,3]); // setting the range of the input data
            // Load GeoJSON data and merge with states data
        d3.json("https://gist.githubusercontent.com/michellechandra/0b2ce4923dc9b5809922/raw/a476b9098ba0244718b496697c5b350460d32f99/us-states.json").then(function(json) {

            // Loop through each state data value in the .csv file
            for (var i = 0; i < data.length; i++) {

                // Grab State Name
                var dataState = data[i].state;

                // Grab data value 
                var dataValue = data[i].visited;

                // Find the corresponding state inside the GeoJSON
                for (var j = 0; j < json.features.length; j++)  {
                    var jsonState = json.features[j].properties.name;

                    if (dataState == jsonState) {
                        // Copy the data value into the JSON
                        json.features[j].properties.visited = dataValue; 

                        // Stop looking through the JSON
                        break;
                    }
                }
            }

            // Bind the data to the SVG and create one path per GeoJSON feature
            svg.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("stroke", "#fff")
                .style("stroke-width", "1")
                .style("fill", function(d) {
                    // Get data value
                    var value = d.properties.visited;

                    if (value) {
                    //If value exists…
                    return color(value);
                    } else {
                    //If value is undefined…
                    return "rgb(213,222,217)";
                    }
                });

                // Map the cities I have lived in!
                d3.csv("https://raw.githubusercontent.com/Luke-S-Snyder/divi/main/examples/data/cities-lived.csv").then(function(data) {

                    svg.selectAll("circle")
                        .data(data)
                        .enter()
                        .append("circle")
                        .attr("cx", function(d) {
                            return projection([d.lon, d.lat])[0];
                        })
                        .attr("cy", function(d) {
                            return projection([d.lon, d.lat])[1];
                        })
                        .attr("r", function(d) {
                            return Math.sqrt(d.years) * 4;
                        })
                            .style("fill", "rgb(217,91,67)")	
                            .style("opacity", 0.85)	
                        
                    // // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
                    // var legend = d3.select("body").append("svg")
                    //       			.attr("class", "legend")
                    //      			.attr("width", 140)
                    //     			.attr("height", 200)
                    //    				.selectAll("g")
                    //    				.data(color.domain().slice().reverse())
                    //    				.enter()
                    //    				.append("g")
                    //      			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    
                    //   	legend.append("rect")
                    //    		  .attr("width", 18)
                    //    		  .attr("height", 18)
                    //    		  .style("fill", color);
    
                    //   	legend.append("text")
                    //   		  .data(legendText)
                    //       	  .attr("x", 24)
                    //       	  .attr("y", 9)
                    //       	  .attr("dy", ".35em")
                    //       	  .text(function(d) { return d; });
                    divi.hydrate("#mapsvg");
                });
        });
    });
}
