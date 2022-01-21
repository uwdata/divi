import * as d3 from 'd3';
import React from 'react';

function ScatterPlot() {
    const svgRef = React.useRef(null);

    // set the dimensions and margins of the graph
    const width = 600,
        height = 600;

    React.useEffect(() => {
        // append the svg object to the body of the page
        const svg = d3.select(svgRef.current)
        .attr("id", "svg_plot")
        .attr("width", width)
        .attr("height", height);

        //Read the data
        d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv").then(function(data) {
        // Add X axis
        const x = d3.scaleLinear()
        .domain([0, 4000])
        .range([ 0, width ]);

        // Add Y axis
        const y = d3.scaleLinear()
        .domain([0, 500000])
        .range([ height, 0]);

        // Add dots
        svg.append('g')
        .selectAll("dot")
        .data(data)
        .join("circle")
            .attr("cx", function (d) { return x(d.GrLivArea); } )
            .attr("cy", function (d) { return y(d.SalePrice); } )
            .attr("r", 1.5)
            .style("fill", "#69b3a2")
        });
    }, []);

    return (
        <svg ref={svgRef}></svg>
    )
}

export default ScatterPlot;
