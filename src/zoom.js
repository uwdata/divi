import { INTERACTION_CONSTANTS } from "./constants";
// import { svg_objects } from "./inspect";
import { axisBottom, axisLeft } from "./d3/axis_old";
import { parseSVG } from 'svg-path-parser';
// import { ticks } from "d3";
// import { ZoomTransform } from 'd3-zoom';

export function zoom(SVG) {
    const svg = d3.select("#" + SVG.get_svg().id);

    if (SVG.get_x_axis_ticks().length || SVG.get_y_axis_ticks().length) {
        SVG.get_x_axis_ticks()[1].parentElement.setAttribute("id", "x-axis-tmp");
        SVG.get_y_axis_ticks()[1].parentElement.setAttribute("id", "y-axis-tmp");
    
        SVG.get_x_axis_ticks().forEach((d) => {
            d.__transform = d.getAttribute("transform");
        });
        SVG.get_y_axis_ticks().forEach((d) => {
            d.__transform = d.getAttribute("transform");
        });
    
        var g_y_axis = svg.selectAll("#y-axis-tmp");
        var g_x_axis = svg.selectAll("#x-axis-tmp");
    }

    if (SVG.get_x_scale() && SVG.get_x_scale().domain().length === 2) {
        // Infer original X-axis domain
        let tick_left = +SVG.get_x_axis_ticks()[0].__transform.match(/(\d+\.?\d*)/g)[0];
        let tick_right = +SVG.get_x_axis_ticks()[SVG.get_x_axis_ticks().length - 1].__transform.match(/(\d+\.?\d*)/g)[0];

        let new_domain_x = SVG.get_x_axis_range().map(
            SVG.get_x_scale().copy().range([tick_left, tick_right]).invert, SVG.get_x_scale()
        );

        SVG.get_x_scale().domain(new_domain_x);
        g_x_axis.call(SVG.get_x_axis().scale(SVG.get_x_scale()));
    }

    if (SVG.get_y_scale() && SVG.get_y_scale().domain().length === 2) {
        // Infer original Y-axis domain
        let tick_bottom = +SVG.get_y_axis_ticks()[0].__transform.match(/(\d+\.?\d*)/g)[1];
        let tick_top = +SVG.get_y_axis_ticks()[SVG.get_y_axis_ticks().length - 1].__transform.match(/(\d+\.?\d*)/g)[1];

        let new_domain_y = SVG.get_y_axis_range().map(
            SVG.get_y_scale().copy().range([tick_bottom, tick_top]).invert, SVG.get_y_scale()
        );

        SVG.get_y_scale().domain(new_domain_y);
        g_y_axis.call(SVG.get_y_axis().scale(SVG.get_y_scale()));
    }
    
    if (!SVG.has_domain() && SVG.get_x_axis() && SVG.get_y_axis()) {
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

    if (marks.node().parentElement.id !== "_g_clip") {
        let container = document.createElementNS("http://www.w3.org/2000/svg", "g");
        container.id = "_g_clip";
        marks.node().parentElement.appendChild(container);
        marks.nodes().forEach(d => container.appendChild(d));
    }
    marks.node().parentElement.setAttribute('clip-path', 'url(#clip-' + SVG.get_svg().id + ')');

    svg.call(d3.zoom().on("zoom", function({transform}) {
        if (!SVG.get_x_axis() && !SVG.get_y_axis()) {
            marks.attr('transform', transform);
            svg.selectAll('text').attr('transform', transform);
            return;
        }

        if (marks.node().nodeName === 'circle') {
            marks.attr("r", 5 / transform.k);
            marks.attr("transform", transform);

            g_y_axis.call(SVG.get_y_axis().scale(transform.rescaleY(SVG.get_y_scale())));
        } else { // if (marks.node().nodeName === 'path') {
            marks.attr('vector-effect', 'non-scaling-stroke');
            marks.attr('transform', 'translate(' + transform.x + ',0) scale(' + transform.k + ',1)');
        }

        if (SVG.get_x_scale().domain().length > 2) {
            SVG.get_x_axis_ticks().map((d) => {
                let new_transform_x = +d.__transform.match(/(\d+\.?\d*)/g)[0] * transform.k + transform.x;
                let transform_y = +d.__transform.match(/(\d+\.?\d*)/g)[1];

                if (new_transform_x < SVG.get_x_axis_range()[0] - 0.5 || new_transform_x > SVG.get_x_axis_range()[1] + 0.5) {
                    d.style.visibility = 'hidden';
                } else {
                    d.setAttribute('transform', 'translate(' + new_transform_x + ',' + transform_y + ')');
                    d.style.visibility = 'visible';
                }
            });
        } else if (SVG.get_x_scale().domain().length === 2) {
            g_x_axis.call(SVG.get_x_axis().scale(transform.rescaleX(SVG.get_x_scale())));
        }
    }));
}
