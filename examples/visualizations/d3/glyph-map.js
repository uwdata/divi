function createGlyphMap() {
    // Load in my states data!
    d3.json("https://gist.githubusercontent.com/michellechandra/0b2ce4923dc9b5809922/raw/a476b9098ba0244718b496697c5b350460d32f99/us-states.json").then(function(map_data) {
        d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json").then(function(us){
        // Load GeoJSON data and merge with states data
        d3.json("https://api.census.gov/data/2016/acs/acs5/cprofile?get=CP05_2012_2016_001E,NAME&for=county:*").then(function(json) {


            // D3 Projection
            var projection = d3.geoAlbersUsa()
            // let path1 = d3.geoPath(d3.geoAlbersUsa().translate([500, 500]).scale(750));
            // .translate([500/2, 500/2])    // translate to center of screen
            // .scale([1000]);          // scale things down so see entire US

        // Define path generator
        var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
        // .projection(projection);  // tell path generator to use albersUsa projection

            let features = new Map(topojson.feature(us, us.objects.counties).features.map(d => [d.id, d]));
            let data = json.slice(1).map(([population, name, state, county]) => {
                const id = state + county;
                const feature = features.get(id);
                // console.log(feature)
                // console.log([path1.centroid(feature), path.centroid(feature)])
                return {
                  id,
                  position: feature && path.centroid(feature),
                  title: feature && feature.properties.name,
                  value: +population
                };
              });
            //   console.log(data)
              let length = d3.scaleLinear([0, d3.max(data, d => d.value)], [0, 200]);
              let spike = (length, width = 7) => `M${-width / 2},0L0,${-length}L${width / 2},0`;

            const svg = d3.select("#container")
            .append("svg")
            .attr("id", "chart")
            .attr("width", 2000)
            .attr('height', 2000);
            
            // svg.append("path")
            // .datum(topojson.feature(us, us.objects.nation))
            // .attr("fill", "#e0e0e0")
            // .attr("d", path);
            
            // svg.append("path")
            // .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
            // .attr("fill", "none")
            // .attr("stroke", "white")
            // .attr("stroke-linejoin", "round")
            // .attr("d", path);


            // Bind the data to the SVG and create one path per GeoJSON feature
            //  Bind the data to the SVG and create one path per GeoJSON feature
           
            var t = topojson.feature(us, us.objects.states);
             svg.selectAll("path")
             .data(t.features)
             .enter()
             .append("path")
             .attr("d", path)
             .style("stroke", "#fff")
             .style("stroke-width", "1")
             .style("fill", function(d) {
                 // Get data value
                 var value = d.properties.visited;
                 value = false;

                 if (value) {
                 //If value exists…
                 return color(value);
                 } else {
                 //If value is undefined…
                 return "rgb(213,222,217)";
                 }
             });
            
            const legend = svg.append("g")
            .attr("fill", "#777")
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .selectAll("g")
            .data(length.ticks(4).slice(1).reverse())
            .join("g")
            .attr("transform", (d, i) => `translate(${1000 - (i + 1) * 18},525)`);
            
            legend.append("path")
            .attr("fill", "red")
            .attr("fill-opacity", 0.3)
            .attr("stroke", "red")
            .attr("d", d => spike(length(d)));
            
            legend.append("text")
            .attr("dy", "1.3em")
            .text(length.tickFormat(4, "s"));
            
            svg.append("g")
            .attr("fill", "red")
            .attr("fill-opacity", 0.3)
            .attr("stroke", "red")
            .selectAll("path")
            .data(data
            .filter(d => d.position)
            .sort((a, b) => d3.ascending(a.position[1], b.position[1])
                || d3.ascending(a.position[0], b.position[0])))
            .join("path")
            .attr("transform", d => `translate(${d.position})`)
            .attr("d", d => spike(length(d.value)))
            .append("title")
            .text(d => `${d.title}
            ${d3.format(d.value)}`);

            divi.hydrate("#chart")
        });
    });
    });
}
