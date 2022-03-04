import { INTERACTION_CONSTANTS } from "./constants";
// import { svg_objects } from "./inspect";
import { axisBottom, axisLeft } from "./d3/axis_old";
import { parseSVG } from 'svg-path-parser';
// import { ticks } from "d3";
// import { ZoomTransform } from 'd3-zoom';

export function zoom(SVG, control, axis_control) {
    var svg = d3.select("#" + SVG.state().svg.id);

    if (SVG.state().x_axis.scale && !SVG.state().x_axis.ordinal.length) SVG.state().x_axis.axis.scale(SVG.state().x_axis.scale)();
    if (SVG.state().y_axis.scale && !SVG.state().y_axis.ordinal.length) SVG.state().y_axis.axis.scale(SVG.state().y_axis.scale)();

    svg.append('defs')
        .append('clipPath')
        .attr('id', 'clip-' + SVG.state().svg.id)
        .append('rect')
        .attr('x', SVG.state().x_axis.range[0])
        .attr('y', SVG.state().y_axis.range[1])
        .attr('width', Math.abs(SVG.state().x_axis.range[1] - SVG.state().x_axis.range[0]))
        .attr('height', Math.abs(SVG.state().y_axis.range[0] - SVG.state().y_axis.range[1]));

    const marks = svg.selectAll('[__mark__="true"]');

    if (marks.node().parentElement.id !== "_g_clip") {
        let container = document.createElementNS("http://www.w3.org/2000/svg", "g");
        container.id = "_g_clip";
        marks.node().parentElement.appendChild(container);
        marks.nodes().forEach(d => container.appendChild(d));
    }
    marks.node().parentElement.setAttribute('clip-path', 'url(#clip-' + SVG.state().svg.id + ')');

    var left_bound = marks.node()._global_transform[0] + SVG.state().svg.getBoundingClientRect().left;
    var top_bound = marks.node()._global_transform[1] + SVG.state().svg.getBoundingClientRect().top;

    // var g_x_axis = d3.select(".x-axis.tick").select(function() { return this.parentNode; });
    // var g_y_axis = d3.select(".y-axis.tick").select(function() { return this.parentNode; });
    var g_x_axis = svg.append("g").attr("id", "x-axis-zoom-accessor");
    var g_y_axis = svg.append("g").attr("id", "y-axis-zoom-accessor");

    let z = d3.zoomIdentity;
    const zoomX = d3.zoom();
    const zoomY = d3.zoom();
    const tx = () => d3.zoomTransform(g_x_axis.node());
    const ty = () => d3.zoomTransform(g_y_axis.node());
    g_x_axis.call(zoomX).attr("pointer-events", "none");
    g_y_axis.call(zoomY).attr("pointer-events", "none");

    let zoom_callback = function({sourceEvent, transform}) {
        if (!SVG.state().x_axis.axis && !SVG.state().y_axis.axis) {
            marks.attr('transform', transform);
            svg.selectAll('text').attr('transform', transform);
            return;
        }

        const k = transform.k / z.k;
        const x = (transform.x - z.x) / tx().k;
        const y = (transform.y - z.y) / ty().k;

        let zoom_X = sourceEvent.clientX - left_bound > SVG.state().x_axis.range[0], 
            zoom_Y = sourceEvent.clientY - top_bound < SVG.state().y_axis.range[0];
        let cliX = sourceEvent.clientX - marks.node()._global_transform[0] - SVG.state().svg.getBoundingClientRect().left;
        let cliY = sourceEvent.clientY - marks.node()._global_transform[1] - SVG.state().svg.getBoundingClientRect().top;
        
        if (k === 1) {
            zoom_X && g_x_axis.call(zoomX.translateBy, x, 0);
        } else {
            zoom_X && g_x_axis.call(zoomY.scaleBy, k, [cliX, cliY]);
        }
        SVG.state().x_axis.ordinal.length ?
            SVG.state().x_axis.axis.applyTransform(tx())() :
            SVG.state().x_axis.axis.scale(tx().rescaleX(SVG.state().x_axis.scale))();

        let discrete = marks.node().nodeName === "path" && marks.node().type === "ellipse" && zoom_Y;
        let not_discrete = marks.node().nodeName === "path" && marks.node().type !== "ellipse" && zoom_Y && !zoom_X;
        let ordinal = SVG.state().x_axis.scale.domain().length > 2 && zoom_Y && !zoom_X;
        let not_path = SVG.state().x_axis.scale.domain().length == 2 && marks.node().nodeName !== "path" && zoom_Y;

        if (k === 1) {
            (not_path || discrete || not_discrete || ordinal) && g_y_axis.call(zoomY.translateBy, 0, y);
        } else {
            (not_path || discrete || not_discrete || ordinal) && g_y_axis.call(zoomY.scaleBy, k, [cliX, cliY]);   
        }
        SVG.state().y_axis.axis.scale(ty().rescaleY(SVG.state().y_axis.scale))();
        
        marks.attr("transform", function() {
            let transform = this.__transform.match(/(-?\d+\.?-?\d*)/g);
            
            let t_x = (this.getBoundingClientRect().left - this._global_transform[0] - SVG.state().svg.getBoundingClientRect().left +
                this.getBoundingClientRect().right - this._global_transform[0] - SVG.state().svg.getBoundingClientRect().left) / 2;
            let t_y = (this.getBoundingClientRect().top - this._global_transform[1] - SVG.state().svg.getBoundingClientRect().top + 
                this.getBoundingClientRect().bottom - this._global_transform[1] - SVG.state().svg.getBoundingClientRect().top) / 2;

            if (!this._t) this._t = [t_x, t_y];
            let x_offset = +transform[0] === 0 ? 0 : +transform[0] - +this._t[0];
            let y_offset = +transform[1] === 0 ? 0 : +transform[1] - +this._t[1];

            let new_x = tx().applyX(+this._t[0]) + x_offset;
            let new_y = ty().applyY(+this._t[1]) + y_offset;

            let is_ellipse = this.nodeName === "path" && this.type !== "ellipse";
            let is_ordinal = SVG.state().x_axis.scale.domain().length > 2;
            if (is_ellipse || is_ordinal) {
                return 'translate(' + tx().x + ',' + ty().y + ') scale(' + tx().k + ',' + ty().k + ')';
            }

            return 'translate(' + (this.hasAttribute("cx") ? new_x - this.getAttribute("cx") : new_x) + ',' + (this.hasAttribute("cy") ? new_y - this.getAttribute("cy") : new_y) + ')';
        });

        marks.attr('vector-effect', 'non-scaling-stroke');

        svg.selectAll(".hover").attr("display", "none");
        let tooltips = document.querySelectorAll(".tooltip");
        if (tooltips.length) tooltips.forEach(d => d.style['visibility'] = 'hidden');

        z = transform;
    };

    control.addEventListener('change', function() {
        if (this.checked) {
            svg.call(d3.zoom().on("zoom", zoom_callback)); //.on("mousedown.zoom", null).on("dblclick.zoom", null);
        } else {
            svg.call(d3.zoom().on("zoom", null));
        }
    });

    axis_control.addEventListener('change', function(event) {
        console.log(event.id);
    });
}
