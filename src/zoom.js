import { INTERACTION_CONSTANTS } from "./constants";
// import { svg_objects } from "./inspect";
import { axisBottom, axisLeft } from "./d3/axis_old";
import { parseSVG } from 'svg-path-parser';
// import { ticks } from "d3";
// import { ZoomTransform } from 'd3-zoom';

export function zoom(SVG) {
    var svg = d3.select("#" + SVG.state().svg.id);

    if (SVG.state().x_axis.scale && SVG.state().x_axis.domain.length === 2) {
        // Infer original X-axis domain
        let tick_left = +SVG.state().x_axis.ticks[0]['ticks'][0].getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[0];
        let tick_right = +SVG.state().x_axis.ticks[SVG.state().x_axis.ticks.length - 1]['ticks'][0].getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[0];
        // console.log([tick_left, tick_right]);
        let new_domain_x = SVG.state().x_axis.range.map(
            SVG.state().x_axis.scale.copy().range([tick_left, tick_right]).invert, SVG.state().x_axis.scale
        );
        // console.log(SVG.state().x_axis.scale.copy().range([tick_left, tick_right]).invert(tick_left))
        // console.log(SVG.state().x_axis.scale.copy().range([tick_left, tick_right]).invert(tick_right))
        // // console.log(new_domain_x);
        // console.log("")

        SVG.state().x_axis.scale.domain(new_domain_x);
        SVG.state().x_axis.axis.scale(SVG.state().x_axis.scale)();
    }

    if (SVG.state().y_axis.scale && SVG.state().y_axis.domain.length === 2) {
        // Infer original Y-axis domain
        let tick_bottom = +SVG.state().y_axis.ticks[0]['ticks'][0].getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[1];
        let tick_top = +SVG.state().y_axis.ticks[SVG.state().y_axis.ticks.length - 1]['ticks'][0].getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[1];

        let new_domain_y = SVG.state().y_axis.range.map(
            SVG.state().y_axis.scale.copy().range([tick_top, tick_bottom]).invert, SVG.state().y_axis.scale
        );
 
        SVG.state().y_axis.scale.domain(new_domain_y);
        SVG.state().y_axis.axis.scale(SVG.state().y_axis.scale)();
    }

    // if (!SVG.has_domain() && SVG.get_x_axis() && SVG.get_y_axis()) {
    //     g_x_axis.select(".domain").attr("display", "none");
    //     g_y_axis.select(".domain").attr("display", "none");
    // }

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

    var g_x_axis = d3.select(".x-axis.tick").select(function() { return this.parentNode; });
    var g_y_axis = d3.select(".y-axis.tick").select(function() { return this.parentNode; });

    let z = d3.zoomIdentity;
    const zoomX = d3.zoom();
    const zoomY = d3.zoom();
    const tx = () => d3.zoomTransform(g_x_axis.node());
    const ty = () => d3.zoomTransform(g_y_axis.node());
    g_x_axis.call(zoomX).attr("pointer-events", "none");
    g_y_axis.call(zoomY).attr("pointer-events", "none");

    svg.call(d3.zoom().on("zoom", function({sourceEvent, transform}) {
        const k = transform.k / z.k;
        let zoom_X = sourceEvent.clientX - left_bound > SVG.state().x_axis.range[0], 
            zoom_Y = sourceEvent.clientY - top_bound < SVG.state().y_axis.range[0];
        let cliX = sourceEvent.clientX - marks.node()._global_transform[0] - SVG.state().svg.getBoundingClientRect().left;
        let cliY = sourceEvent.clientY - marks.node()._global_transform[1] - SVG.state().svg.getBoundingClientRect().top;

        zoom_X && g_x_axis.call(zoomX.scaleBy, k, [cliX, cliY]);
        SVG.state().x_axis.axis.scale(tx().rescaleX(SVG.state().x_axis.scale))();

        zoom_Y && g_y_axis.call(zoomY.scaleBy, k, [cliX, cliY]);
        SVG.state().y_axis.axis.scale(ty().rescaleY(SVG.state().y_axis.scale))();

        // if (!SVG.get_x_axis() && !SVG.get_y_axis()) {
        //     marks.attr('transform', transform);
        //     svg.selectAll('text').attr('transform', transform);
        //     return;
        // }

        // if (SVG.get_x_scale().domain().length > 2) {
        //     SVG.get_x_axis_ticks().map((d) => {
        //         let new_transform_x = +d.__transform.match(/(\d+\.?\d*)/g)[0] * transform.k + transform.x;
        //         let transform_y = +d.__transform.match(/(\d+\.?\d*)/g)[1];

        //         if (new_transform_x < SVG.get_x_axis_range()[0] - 0.5 || new_transform_x > SVG.get_x_axis_range()[1] + 0.5) {
        //             d.style.visibility = 'hidden';
        //         } else {
        //             d.setAttribute('transform', 'translate(' + new_transform_x + ',' + transform_y + ')');
        //             d.style.visibility = 'visible';
        //         }
        //     });
        // } else if (SVG.get_x_scale().domain().length === 2) {
        //     // zoom_X && g_x_axis.call(SVG.get_x_axis().scale(transform.rescaleX(SVG.get_x_scale())));
        //     zoom_X && g_x_axis.call(zoomX.scaleBy, k, [cliX, cliY]);
        //     g_x_axis.call(SVG.get_x_axis().scale(tx().rescaleX(SVG.get_x_scale())));
        // }

        // if (marks.node().nodeName === 'circle') {
        //     if (!marks.node()._r) {
        //         marks.node()._r = marks.node().getAttribute("r");
        //     }
        //     marks.attr("r", marks.node()._r / transform.k);
        // }
           
        //     // zoom_Y && g_y_axis.call(SVG.get_y_axis().scale(tx().rescaleY(SVG.get_y_scale())));
        //     ((marks.node().nodeName !== 'path' && zoom_Y) || (marks.node().nodeName === 'path' && zoom_Y && !zoom_X)) && g_y_axis.call(zoomY.scaleBy, k, [cliX, cliY]);
        //     g_y_axis.call(SVG.get_y_axis().scale(ty().rescaleY(SVG.get_y_scale())));
        marks.attr("transform", function() {
            let transform = this.__transform.match(/(-?\d+\.?-?\d*)/g);
            this._t ? this._t : this._t = [this.getBoundingClientRect().left - this._global_transform[0] - SVG.state().svg.getBoundingClientRect().left,
                this.getBoundingClientRect().top - this._global_transform[1] - SVG.state().svg.getBoundingClientRect().top];

            let new_x = tx().applyX(+this._t[0]) + (+transform[0] - +this._t[0]);
            let new_y = ty().applyY(+this._t[1]) + (+transform[1] - +this._t[1]);

            return 'translate(' + new_x + ',' + new_y + ')'; //scale(' + tx().k + ',' + ty().k + ')';
        });
            // marks.attr("transform", 'translate(' + tx().x + ',' + ty().y + ') scale(' + tx().k + ',' + ty().k + ')');
        // } else { // if (marks.node().nodeName === 'path') {
            marks.attr('vector-effect', 'non-scaling-stroke');
        //     // marks.attr('transform', 'translate(' + tx().x + ',0) scale(' + tx().k + ',1)');
        // // }

        // svg.selectAll(".hover").attr("display", "none");
        // let tooltips = document.querySelectorAll(".tooltip");
        // if (tooltips) {
        //     tooltips.forEach(d => d.style['visibility'] = 'hidden');
        // }

        z = transform;
    })).on("mousedown.zoom", null).on("dblclick.zoom", null);
}
