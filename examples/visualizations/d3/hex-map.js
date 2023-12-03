function createHexChart() {
    var width = 500;
    var height = 300;

    // The svg
    var svg = d3.select("#container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "chart");

    // Map and projection
    var projection = d3.geoMercator()
        .scale(350) // This is the zoom
        .translate([850, 440]); // You have to play with these values to center your map

    // Path generator
    var path = d3.geoPath()
        .projection(projection)

    // Load external data and boot
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/us_states_hexgrid.geojson.json").then(function(data){
        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
                .attr("fill", "#69a2a2")
                .attr("d", path)
                .attr("stroke", "white")

        // Add the labels
        svg.append("g")
            .selectAll("labels")
            .data(data.features)
            .enter()
            .append("text")
                .attr("x", function(d){return path.centroid(d)[0]})
                .attr("y", function(d){return path.centroid(d)[1]})
                .text(function(d){ return d.properties.iso3166_2})
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "central")
                .style("font-size", 11)
                .style("fill", "white")

                divi.hydrate("#chart");
        })

}
