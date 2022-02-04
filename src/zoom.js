import { INTERACTION_CONSTANTS } from "./constants";
// import { svg_objects } from "./inspect";
import { axisBottom, axisLeft } from "./d3/axis_old";
// import { ticks } from "d3";

export function zoom(id, svg_objects) {
    const svg = d3.select("#" + svg_objects.svg.id);
    // const marks = svg.selectAll(INTERACTION_CONSTANTS.SVG_TYPE.SVG_MARK.join());
    const marks = svg.selectAll('[__mark__="true"]');
    const width = parseInt(svg_objects.svg.getAttribute("width"));
    const height = parseInt(svg_objects.svg.getAttribute("height"));
    const extent = [[0, 0], [width, height]];

    let x_tick_min = d3.min(svg_objects.x_axis.ticks.map(function(el) {
        return +el.getAttribute("transform").match(/(\d+\.?\d*)/g)[0];
    }));
    let x_tick_max = d3.max(svg_objects.x_axis.ticks.map(function(el) {
        return +el.getAttribute("transform").match(/(\d+\.?\d*)/g)[0];
    }));
    let y_tick_min = d3.min(svg_objects.y_axis.ticks.map(function(el) {
        return +el.getAttribute("transform").match(/(\d+\.?\d*)/g)[1];
    }));
    let y_tick_max = d3.max(svg_objects.y_axis.ticks.map(function(el) {
        return +el.getAttribute("transform").match(/(\d+\.?\d*)/g)[1];
    }));
    
    const x_scale = (svg_objects.x_axis.domain[0] instanceof Date ? d3.scaleTime() : d3.scaleLinear()) 
        .domain([svg_objects.x_axis.domain[0], svg_objects.x_axis.domain[1]])
        // .range([0, width]);
        .range([x_tick_min, x_tick_max]);
        // .range([0, width]);
    const y_scale = d3.scaleLinear()
        .domain([svg_objects.y_axis.domain[0], svg_objects.y_axis.domain[1]])
        // .range([height, 0]);
        .range([y_tick_max, y_tick_min]);
    const xAxis = d3.
        axisBottom(x_scale)
        .tickSize(svg_objects.x_axis.ticks[1].children[0].getAttribute("y2"))
        .ticks(svg_objects.x_axis.ticks.length);
    // console.log(xAxis.values);
    const yAxis = d3.
        axisLeft(y_scale)
        .tickSize(-svg_objects.y_axis.ticks[1].children[0].getAttribute("x2"))
        .ticks(svg_objects.y_axis.ticks.length);

    // svg_objects.x_axis.ticks.forEach((tick) => {
    //     let pos = tick.getAttribute("transform").match(/(\d+\.?\d*)/g)[0];
    //     // tick.__datatmp__ = tick.__data__;
    //     tick.__pos__ = pos;
    // });

    // svg_objects.y_axis.ticks.forEach((tick) => {
    //     let pos = tick.getAttribute("transform").match(/(\d+\.?\d*)/g)[1];
    //     // tick.__datatmp__ = tick.__data__;
    //     tick.__pos__ = pos;
    // });

    svg_objects.x_axis.ticks[1].parentElement.setAttribute("id", "x-axis-tmp");
    svg_objects.y_axis.ticks[1].parentElement.setAttribute("id", "y-axis-tmp");

    let g_x_axis = svg.selectAll("#x-axis-tmp");
    g_x_axis.call(xAxis);

    let g_y_axis = svg.selectAll("#y-axis-tmp");
    g_y_axis.call(yAxis);

    if (!svg_objects.has_domain) {
        g_x_axis.select(".domain").attr("display", "none");
        g_y_axis.select(".domain").attr("display", "none");
    }

    svg.call(d3.zoom().on("zoom", function({transform}) {
        marks.attr("transform", transform); 
        // svg_objects.x_axis.ticks.attr("transform", transform);

        // console.log(x_scale(5));
        // console.log(transform.rescaleX(x_scale)(5));
        // let new_x_scale = d3.scaleLinear()
        // .domain([svg_objects.x_axis.domain[0], svg_objects.x_axis.domain[1]])
        // .range([0, width]);
        g_x_axis.call(xAxis.scale(transform.rescaleX(x_scale)));
        g_y_axis.call(yAxis.scale(transform.rescaleY(y_scale)));
        // g_x_axis.call(xAxis.transform_cb(transform));
        // g_y_axis.call(yAxis.transform_cb(transform));
    }));
    // Clipping
    // let element = marks.nodes()[0];
    // element.parentElement.id = "test"
    (marks.nodes()[0]).parentElement.id = "mark-g";
    // // `element` is the element you want to wrap
    // let parent = element.parentNode;
    // parent.removeChild(element);
    // let wrapper = document.createElement('g');
    // let new_path = document.createElement('path');
    // new_path.setAttribute("d", element.getAttribute("d"))
    // new_path.setAttribute("fill", "none");
    // new_path.setAttribute("stroke", "steelblue");
    // new_path.setAttribute("stroke-width", 1.5);
    // parent.insertBefore(wrapper, null);
    // wrapper.insertBefore(new_path, null);

    // set the wrapper as child (instead of the element)
    // parent.replaceChild(wrapper, element);
    // wrapper.id = "mark-g";
    // // set element as child of wrapper
    // wrapper.appendChild(element);
    let mark_g = svg.selectAll("#mark-g");
    // let mark_g = element;
    let height_translation = svg_objects
        .x_axis
        .ticks[0]
        .parentElement
        .getAttribute("transform")
        .match(/(\d+)/g)[1];
    console.log(height_translation);
    console.log(svg_objects.x_axis.ticks[0].children[1].getAttribute("y"));
    let height_translation_marks = height_translation - 
        svg_objects.x_axis.ticks[0].children[1].getAttribute("y");

    mark_g.selectAll("defs").remove();
    mark_g.append('defs')
        .append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height_translation_marks + 7);
    mark_g
        .attr('clip-path', 'url(#clip)');

    let width_start = svg_objects
        .y_axis
        .ticks[0]
        .children[1]
        .getAttribute("x");
    // console.log(height_translation);
    // console.log(width_start * 4);
return;
    g_y_axis.selectAll("defs").remove();
    g_y_axis.append('defs')
        .append('clipPath')
        .attr('id', 'clip2')
        .append('rect')
        .attr('x', width_start * 8)
        .attr('y', -100)
        .attr('width', width)
        .attr('height', height_translation + 10);
    g_y_axis
        .attr('clip-path', 'url(#clip2)');
}
