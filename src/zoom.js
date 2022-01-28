import { INTERACTION_CONSTANTS } from "./constants";
import { svg_container, svg_groups, svg_marks } from "./inspect";

export function zoom(id) {
    let el = document.querySelector(id);
    let svg = d3.select(id);
    let g = svg.selectAll(INTERACTION_CONSTANTS.SVG_TYPE.SVG_MARK.join());
    let g_x_axis = svg.select("#x-axis");
    let g_y_axis = svg.select("#y-axis");
    let g_main = document.getElementById("main");
    let dots = d3.select("#dots");
    let matches = g_main.getAttribute("transform").match(/(\d+)/g);
    let width = el.getAttribute("width") - matches[0] - 30;
    let height = el.getAttribute("height") - matches[1] - 40;
    let extent = [[0, 0], [width, height]];
    let x = d3.scaleLinear()
    .domain([4*0.95, 8*1.001])
    .range([0, width]);
    
    let y = d3.scaleLinear()
    .domain([-0.001, 9*1.01])
    .range([height, 0])
    .nice();

    let xAxis = d3.axisBottom(x).tickSize(-height*1.3).ticks(10);
    let yAxis = d3.axisLeft(y).tickSize(-width*1.3).ticks(7);
    g_x_axis.call(xAxis);
    g_x_axis.select(".domain").attr("display", "none");
    g_y_axis.call(yAxis);
    g_y_axis.select(".domain").attr("display", "none");

    svg.call(d3.zoom().extent(extent).translateExtent(extent).on("zoom", function({transform}) {
        g.attr("transform", transform);
        // let x = d3.scaleLinear()
        //     .domain([4*0.95, 8*1.001])
        //     .range([0, width]);
            
        // let y = d3.scaleLinear()
        //     .domain([-0.001, 9*1.01])
        //     .range([height, 0])
        //     .nice();
        
        g_x_axis.call(xAxis.scale(transform.rescaleX(x)));
        g_y_axis.call(yAxis.scale(transform.rescaleY(y)));
        
        // let xAxis = (g, x) => g
        //     .attr("transform", `translate(0,${height})`)
        //     .call(d3.axisBottom(x).tickSize(-height*1.3).ticks(10))
        //     .call(g => g.select(".domain").attr("display", "none"));
        // let yAxis = (g, x) => g
        //     .call(d3.axisLeft(x).tickSize(-width*1.3).ticks(7))
        //     .call(g => g.select(".domain").attr("display", "none"));
        // const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
        // const zy = transform.rescaleX(y).interpolate(d3.interpolateRound);

        // g_x_axis.call(xAxis, zx);
        // g_y_axis.call(yAxis, zy);
    }));

    // Clipping
    svg.selectAll("defs").remove();
    svg.append('defs')
    .append('clipPath')
    .attr('id', 'clip')
    .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height);

        dots
        .attr('clip-path', 'url(#clip)');

    // if (!enabled_interactions[INTERACTION_CONSTANTS.INTERACTION_TYPES.PAN]) {
    //     svg.call(d3.zoom().extent(extent).translateExtent(extent).on("zoom", function({transform}) {
    //         g.attr("transform", transform);

    //         let x = d3.scaleLinear()
    //             .domain([4*0.95, 8*1.001])
    //             .range([0, width]);
    //         let y = d3.scaleLinear()
    //             .domain([-0.001, 9*1.01])
    //             .range([height, 0]);
    //         let xAxis = (g, x) => g
    //             .attr("transform", `translate(0,${height})`)
    //             .call(d3.axisBottom(x).tickSize(-height*1.3).ticks(10))
    //             .call(g => g.select(".domain").attr("display", "none"));
    //         let yAxis = (g, x) => g
    //             .call(d3.axisLeft(x).tickSize(-width*1.3).ticks(7))
    //             .call(g => g.select(".domain").attr("display", "none"));
    //         const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
    //         const zy = transform.rescaleX(y).interpolate(d3.interpolateRound);

    //         g_x_axis.call(xAxis, zx);
    //         g_y_axis.call(yAxis, zy);
    //     }))
    //     .on("mousedown.zoom", null)
    //     .on("touchstart.zoom", null)
    //     .on("touchmove.zoom", null)
    //     .on("touchend.zoom", null);
    // }
}
