import { INTERACTION_CONSTANTS } from "./constants";
// import { svg_objects } from "./inspect";
import { axisBottom, axisLeft } from "./d3/axis_old";
// import { ticks } from "d3";
// import { ZoomTransform } from 'd3-zoom';

export function zoom(SVG) {
    const svg = d3.select("#" + SVG.get_svg().id);

    SVG.get_x_axis_ticks()[1].parentElement.setAttribute("id", "x-axis-tmp");
    SVG.get_y_axis_ticks()[1].parentElement.setAttribute("id", "y-axis-tmp");

    SVG.get_x_axis_ticks().forEach((d) => {
        d.__transform = d.getAttribute("transform");
    });
    SVG.get_y_axis_ticks().forEach((d) => {
        d.__transform = d.getAttribute("transform");
    });

    let g_x_axis = svg.selectAll("#x-axis-tmp");
    g_x_axis.call(SVG.get_x_axis());

    let g_y_axis = svg.selectAll("#y-axis-tmp");
    g_y_axis.call(SVG.get_y_axis());

    // Infer original X-axis domain
    let tick_left = SVG.get_x_axis_ticks()[0];
    let tick_right = SVG.get_x_axis_ticks()[SVG.get_x_axis_ticks().length - 1];

    let coord_shift_x =+SVG.get_x_axis_ticks()[1].__transform.match(/(\d+\.?\d*)/g)[0] - 
        +SVG.get_x_axis_ticks()[0].__transform.match(/(\d+\.?\d*)/g)[0];
    let data_shift_x =SVG.get_x_axis_ticks()[1].__data__ - SVG.get_x_axis_ticks()[0].__data__;

    let prptn_x = Math.abs(coord_shift_x) / Math.abs(data_shift_x);
    let x_range_left = SVG.get_x_axis_range()[0];
    let x_range_right = SVG.get_x_axis_range()[1];

    x_range_left = Math.abs(x_range_left - +tick_left.__transform.match(/(\d+\.?\d*)/g)[0]);
    x_range_right = Math.abs(x_range_right - +tick_right.__transform.match(/(\d+\.?\d*)/g)[0]);
    
    let data_rng_left = x_range_left / prptn_x;
    let data_rng_right = x_range_right / prptn_x;

    if (SVG.get_x_axis_domain()[0] instanceof Date) {
        var new_domain = [
            new Date(SVG.get_x_axis_domain()[0].getTime() - data_rng_left),
            new Date(SVG.get_x_axis_domain()[1].getTime() + data_rng_right)
        ];
    } else {
        var new_domain = [
            SVG.get_x_axis_domain()[0] - data_rng_left,
            SVG.get_x_axis_domain()[1] + data_rng_right
        ];
    }

    SVG.set_x_scale(SVG.get_x_scale().copy().domain(new_domain));
    g_x_axis.call(SVG.get_x_axis().scale(SVG.get_x_scale()));

    // Infer original Y-axis domain
    let tick_bottom = SVG.get_y_axis_ticks()[0];
    let tick_top = SVG.get_y_axis_ticks()[SVG.get_y_axis_ticks().length - 1];

    let coord_shift_y =+SVG.get_y_axis_ticks()[1].__transform.match(/(\d+\.?\d*)/g)[1] - 
        +SVG.get_y_axis_ticks()[0].__transform.match(/(\d+\.?\d*)/g)[1];
    let data_shift_y =SVG.get_y_axis_ticks()[1].__data__ - SVG.get_y_axis_ticks()[0].__data__;

    let prptn_y = Math.abs(coord_shift_y) / Math.abs(data_shift_y);
    let y_range_bottom = SVG.get_y_axis_range()[0];
    let y_range_top = SVG.get_y_axis_range()[1];

    y_range_top = Math.abs(y_range_top - +tick_top.__transform.match(/(\d+\.?\d*)/g)[1]);
    y_range_bottom = Math.abs(y_range_bottom - +tick_bottom.__transform.match(/(\d+\.?\d*)/g)[1]);
    
    let data_rng_top = y_range_top / prptn_y;
    let data_rng_bottom = y_range_bottom / prptn_y;

    SVG.set_y_scale(SVG.get_y_scale().copy().domain([
        SVG.get_y_axis_domain()[0] - data_rng_bottom,
        SVG.get_y_axis_domain()[1] + data_rng_top
    ]));
    g_y_axis.call(SVG.get_y_axis().scale(SVG.get_y_scale()));

    if (!SVG.has_domain()) {
        g_x_axis.select(".domain").attr("display", "none");
        g_y_axis.select(".domain").attr("display", "none");
    }
        
    svg.append('defs')
        .append('clipPath')
        .attr('id', 'clip-' + SVG.get_svg().id)
        .append('rect')
        .attr('x', SVG.get_x_axis_range()[0])
        .attr('y', SVG.get_y_axis_range()[1])
        .attr('width', Math.abs(SVG.get_x_axis_range()[1] - SVG.get_x_axis_range()[0]))
        .attr('height', Math.abs(SVG.get_y_axis_range()[0] - SVG.get_y_axis_range()[1]));
    
    const marks = svg.selectAll('[__mark__="true"]');
    marks.nodes()[0].parentElement.setAttribute('clip-path', 'url(#clip-' + SVG.get_svg().id + ')');

    svg.call(d3.zoom().on("zoom", function({transform}) {
        marks.attr("transform", transform);
        if (marks.node().nodeName === 'circle') {
            marks.attr("r", 5 / transform.k);
        }
        else if (marks.node().nodeName === 'path') {
            marks.attr('vector-effect', 'non-scaling-stroke');
        }

        g_x_axis.call(SVG.get_x_axis().scale(transform.rescaleX(SVG.get_x_scale())));
        g_y_axis.call(SVG.get_y_axis().scale(transform.rescaleY(SVG.get_y_scale())));
    }));
}
