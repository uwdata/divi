import { zoomTransform, zoom as _zoom, zoomIdentity } from '../_d3/zoom';
import { select } from 'd3-selection';
import { Line, Polygon, Polyline } from '../state/constants';
import { Transform } from '../util/transform';
import noevent from '../_d3/zoom/noevent';

export function zoom(state) {
    const svg = select('#' + state.svg.id);

    if (state.xAxis.scale && !state.xAxis.ordinal.length) state.xAxis.axis.scale(state.xAxis.scale)();
    if (state.yAxis.scale && !state.yAxis.ordinal.length) state.yAxis.axis.scale(state.yAxis.scale)();
    
    const marks = svg.selectAll('[__mark__="true"]');

    svg.append('defs')
        .append('clipPath')
        .attr('id', 'clip-' + state.svg.id)
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', Math.abs(state.xAxis.range[1] - state.xAxis.range[0]))
        .attr('height', Math.abs(state.yAxis.range[0] - state.yAxis.range[1]));
    
    if (state.xAxis.scale && state.yAxis.scale) {
        for (const node of marks.nodes()) {
            if (node.parentElement.hasAttribute('clip-path')) continue;
            let container = node.parentElement;
            if (container.id !== '_g_clip') {
                container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                container.id = '_g_clip';
                container.setAttribute('clip-path', 'url(#clip-' + state.svg.id + ')'); 
    
                node.parentElement.appendChild(container);
            }  
            container.appendChild(node);
        }
    }

    // if (marks.node().parentElement.id !== '_g_clip') {
    //     const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    //     container.id = '_g_clip';
    //     marks.node().parentElement.appendChild(container);
    //     marks.nodes().forEach(d => container.appendChild(d));
    // }
    // marks.node().parentElement.setAttribute('clip-path', 'url(#clip-' + state.svg.id + ')');
    // return;
    var left_bound = state.svg.getBoundingClientRect().left;
    var top_bound = state.svg.getBoundingClientRect().top;

    // var g_x_axis = d3.select(".x-axis.tick").select(function() { return this.parentNode; });
    // var g_y_axis = d3.select(".y-axis.tick").select(function() { return this.parentNode; });
    const gXAxis = svg.append('g').attr('id', 'x-axis-zoom-accessor');
    const gYAxis = svg.append('g').attr('id', 'y-axis-zoom-accessor');

    var z = zoomIdentity;
    const zoomX = _zoom();
    const zoomY = _zoom();
    const tx = () => zoomTransform(gXAxis.node());
    const ty = () => zoomTransform(gYAxis.node());
    gXAxis.call(zoomX).attr('pointer-events', 'none');
    gYAxis.call(zoomY).attr('pointer-events', 'none');

    function zoomCallback({sourceEvent, transform}) {
        var zoom_enabled = true,
        pan_enabled = true,
        control_zoom_X = true,
        control_zoom_Y = true,
        control_pan_X = state.interactions.pan.flag,
        control_pan_Y = state.interactions.pan.flag,
        pan_shift = false;

        let zoom_X = sourceEvent.clientX - left_bound > state.xAxis.range[0], 
            zoom_Y = sourceEvent.clientY - top_bound < state.yAxis.range[0];

        if (sourceEvent.type === "wheel" || sourceEvent.type === "dblclick") {
            if (state.svg.parentNode.style['visibility'] === 'hidden') return;

            let pan_elem = document.getElementById("panMode");
            let brush_elem = document.getElementById("brushMode");
            let filter_elem = document.getElementById("filterMode");
            let annotate_elem = document.getElementById("annotateMode");
    
            pan_elem.style['opacity'] = 1;
            brush_elem.style['opacity'] = 0.4;
            annotate_elem.style['opacity'] = 0.4;
    
            state.interactions.pan.flag = true;
            state.interactions.brush.flag = false;
            state.interactions.annotate.flag = false;
            state.svg.style['cursor'] = 'move';
        }

        sourceEvent.preventDefault();

        const k = transform.k / z.k;
        const x = (transform.x - z.x) / tx().k;
        const y = (transform.y - z.y) / ty().k;

        // if (!state.xAxis.axis && !state.yAxis.axis) {
            const svgClientRect = state.svg.getBoundingClientRect();
            const cliX = sourceEvent.clientX - svgClientRect.left;
            const cliY = sourceEvent.clientY - svgClientRect.top;
            // let cliX = sourceEvent.clientX - marks.node()._global_transform[0] - SVG.state().svg.getBoundingClientRect().left;
            // let cliY = sourceEvent.clientY - marks.node()._global_transform[1] - SVG.state().svg.getBoundingClientRect().top;

            // if (k === 1) {
                //         control_pan_X && g_x_axis.call(zoomX.translateBy, x, 0);
                //         control_pan_Y && g_y_axis.call(zoomY.translateBy, 0, y);
                //     } else {
                //         control_zoom_X && g_x_axis.call(zoomX.scaleBy, k, [cliX, cliY]);
                //         control_zoom_Y && g_y_axis.call(zoomY.scaleBy, k, [cliX, cliY]);
                //         // SVG.disambiguate("zoom", true);
                //     }

            if (k === 1) {
                control_pan_X && gXAxis.call(zoomX.translateBy, x, 0);
                control_pan_Y && gYAxis.call(zoomY.translateBy, 0, y);
            } else {
                control_zoom_X && zoom_X && gXAxis.call(zoomX.scaleBy, k, [cliX, cliY]);
                control_zoom_Y && zoom_Y &&gYAxis.call(zoomY.scaleBy, k, [cliX, cliY]);
            }
            state.yAxis.axis.scale(ty().rescaleY(state.yAxis.scale))();
            state.xAxis.axis.scale(tx().rescaleX(state.xAxis.scale))();
            // marks.attr('transform', 'translate(' + tx().x + ',' + ty().y + ') scale(' + tx().k + ',' + ty().k + ')');
            marks.attr('transform', function() {
                const lineChart = this.type && (this.type === Line || this.type === Polygon || this.type === Polyline);

                // if (this.type === Polygon || this.type === Polyline) {
                //     this.globalPosition.translate.x = this.clientRect.left; + this.clientRect.width / 2;
                //     this.globalPosition.translate.y = this.clientRect.top + this.clientRect.height / 2;
                // }

                const translateX = tx().applyX(this.globalPosition.translate.x) - (this.globalPosition.translate.x);
                // const translateY = this.type && lineChart ? 0
                const translateY = ty().applyY(this.globalPosition.translate.y) - (this.globalPosition.translate.y);
                const scaleX = this.type && lineChart ? tx().k : 1;
                const scaleY = this.type && lineChart ? ty().k : 1;
  
                return this.localTransform.getTransform(new Transform(translateX, translateY, scaleX, scaleY));
            });

            // svg.selectAll('text').attr('transform','translate(' + tx().x + ',' + ty().y + ') scale(' + tx().k + ',' + ty().k + ')');
        // }
        z = transform;
    }

        //    marks.attr("transform", function() {
        //     let transform = this.__transform.match(/(-?\d+\.?-?\d*)/g);
            
        //     let t_x = (this.getBoundingClientRect().left - this._global_transform[0] - SVG.state().svg.getBoundingClientRect().left +
        //         this.getBoundingClientRect().right - this._global_transform[0] - SVG.state().svg.getBoundingClientRect().left) / 2;
        //     let t_y = (this.getBoundingClientRect().top - this._global_transform[1] - SVG.state().svg.getBoundingClientRect().top + 
        //         this.getBoundingClientRect().bottom - this._global_transform[1] - SVG.state().svg.getBoundingClientRect().top) / 2;

        //     if (!this._t) this._t = [t_x, t_y];
        //     let x_offset = +transform[0] === 0 ? 0 : +transform[0] - +this._t[0];
        //     let y_offset = +transform[1] === 0 ? 0 : +transform[1] - +this._t[1];

        //     let new_x = tx().applyX(+this._t[0]) + x_offset;
        //     let new_y = ty().applyY(+this._t[1]) + y_offset;

        //     let is_ellipse = this.nodeName === "path" && this.type !== "ellipse";
        //     let is_ordinal = SVG.state().x_axis.scale.domain().length > 2;
        //     if (is_ellipse || is_ordinal) {
        //         return 'translate(' + tx().x + ',' + ty().y + ') scale(' + tx().k + ',' + ty().k + ')';
        //     }

        //     return 'translate(' + (this.hasAttribute("cx") ? new_x - this.getAttribute("cx") : new_x) + ',' + (this.hasAttribute("cy") ? new_y - this.getAttribute("cy") : new_y) + ')';
        // });

        
        // if (sourceEvent.type === "wheel" || sourceEvent.type === "dblclick") {
        //     if (SVG.state().svg.parentNode.style['visibility'] === 'hidden') return;

        //     let pan_elem = document.getElementById("pan_mode");
        //     let brush_elem = document.getElementById("brush_mode");
        //     let filter_elem = document.getElementById("filter_mode");
        //     let annotate_elem = document.getElementById("annotate_mode");
    
        //     pan_elem.style['opacity'] = 1;
        //     brush_elem.style['opacity'] = 0.4;
        //     annotate_elem.style['opacity'] = 0.4;
    
        //     SVG.state().interactions.pan.flag = true;
        //     SVG.state().interactions.brush.flag = false;
        //     SVG.state().interactions.annotate.flag = false;
        //     SVG.state().svg.style['cursor'] = 'move';
        // }

        // var zoom_enabled = document.getElementById("zoom").checked;
        // var pan_enabled = document.getElementById("pan").checked;

        // document.getElementById("modebar").style['visibility'] = 'hidden';
        // if (SVG.state().interactions.pan.flag) document.getElementById("brush_disam").style['display'] = 'block';
        // var zoom_enabled = true,
        //     pan_enabled = true,
        //     control_zoom_X = true,
        //     control_zoom_Y = true,
        //     control_pan_X = SVG.state().interactions.pan.flag,
        //     control_pan_Y = SVG.state().interactions.pan.flag,
        //     pan_shift = false;
        // var control_zoom_X = document.getElementById("zoom-2d").className.split(" ").indexOf("bg-primary") > -1 ||
        //     document.getElementById("zoom-x").className.split(" ").indexOf("bg-primary") > -1;
        // var control_zoom_Y = document.getElementById("zoom-2d").className.split(" ").indexOf("bg-primary") > -1 ||
        //     document.getElementById("zoom-y").className.split(" ").indexOf("bg-primary") > -1;
        // var control_pan_X = document.getElementById("pan-2d").className.split(" ").indexOf("bg-primary") > -1 ||
        //     document.getElementById("pan-x").className.split(" ").indexOf("bg-primary") > -1;
        // var control_pan_Y = document.getElementById("pan-2d").className.split(" ").indexOf("bg-primary") > -1 ||
        //     document.getElementById("pan-y").className.split(" ").indexOf("bg-primary") > -1;

        // var pan_shift = document.getElementById("pan-shift").className.split(" ").indexOf("bg-primary") > -1 &&
        //     document.getElementById("pan-drag").className.split(" ").indexOf("bg-primary") <= -1;

        // if (!state.xAxis.axis && !state.yAxis.axis) {
        //     let cliX = sourceEvent.clientX - marks.node()._global_transform[0] - SVG.state().svg.getBoundingClientRect().left;
        //     let cliY = sourceEvent.clientY - marks.node()._global_transform[1] - SVG.state().svg.getBoundingClientRect().top;

        //     if (k === 1) {
        //         control_pan_X && g_x_axis.call(zoomX.translateBy, x, 0);
        //         control_pan_Y && g_y_axis.call(zoomY.translateBy, 0, y);
        //     } else {
        //         control_zoom_X && g_x_axis.call(zoomX.scaleBy, k, [cliX, cliY]);
        //         control_zoom_Y && g_y_axis.call(zoomY.scaleBy, k, [cliX, cliY]);
        //         // SVG.disambiguate("zoom", true);
        //     }
        //     marks.attr('transform', 'translate(' + tx().x + ',' + ty().y + ') scale(' + tx().k + ',' + ty().k + ')');
        //     svg.selectAll('text').attr('transform','translate(' + tx().x + ',' + ty().y + ') scale(' + tx().k + ',' + ty().k + ')');
        //     z = transform;
        //     return;
        // }

        // let zoom_X = sourceEvent.clientX - left_bound > SVG.state().x_axis.range[0], 
        //     zoom_Y = sourceEvent.clientY - top_bound < SVG.state().y_axis.range[0];
        // let cliX = sourceEvent.clientX - marks.node()._global_transform[0] - SVG.state().svg.getBoundingClientRect().left;
        // let cliY = sourceEvent.clientY - marks.node()._global_transform[1] - SVG.state().svg.getBoundingClientRect().top;

        // // let std = SVG.std();
        // // if (std < 0.5 && zoom_X && zoom_Y) {
        // //     zoom_X = true;
        // //     zoom_Y = false;
        // // } else if (std > 2 && zoom_X && zoom_Y) {
        // //     zoom_X = false;
        // //     zoom_Y = true;
        // // }
        
        // if (k === 1 && pan_enabled) {
        //     ((!pan_shift && !sourceEvent.shiftKey) || (pan_shift && sourceEvent.shiftKey)) && 
        //         control_pan_X && zoom_X && g_x_axis.call(zoomX.translateBy, x, 0);
        //         // SVG.disambiguate("zoom");
        // } else if (zoom_enabled) {
        //     control_zoom_X && zoom_X && g_x_axis.call(zoomX.scaleBy, k, [cliX, cliY]);
        //     // SVG.disambiguate("zoom", true);
        // }
        // SVG.state().x_axis.ordinal.length ?
        //     SVG.state().x_axis.axis.applyTransform(tx())() :
        //     SVG.state().x_axis.axis.scale(tx().rescaleX(SVG.state().x_axis.scale))();

        // let discrete = marks.node().nodeName === "path" && marks.node().type === "ellipse" && zoom_Y;
        // let not_discrete = marks.node().nodeName === "path" && marks.node().type !== "ellipse" && zoom_Y && !zoom_X;
        // let ordinal = SVG.state().x_axis.scale.domain().length > 2 && zoom_Y && !zoom_X;
        // let not_path = SVG.state().x_axis.scale.domain().length == 2 && marks.node().nodeName !== "path" && zoom_Y;

        // if (k === 1 && pan_enabled) {
        //     ((!pan_shift && !sourceEvent.shiftKey) || (pan_shift && sourceEvent.shiftKey)) && 
        //         control_pan_Y && (not_path || discrete || not_discrete || ordinal) && g_y_axis.call(zoomY.translateBy, 0, y);
        // } else if (zoom_enabled) {
        //     control_zoom_Y && (not_path || discrete || not_discrete || ordinal) && g_y_axis.call(zoomY.scaleBy, k, [cliX, cliY]);   
        // }
        // SVG.state().y_axis.axis.scale(ty().rescaleY(SVG.state().y_axis.scale))();

        // var keys = (sourceEvent.ctrlKey ? " ctrl " : "") + (sourceEvent.shiftKey ? " shift " : "") + (sourceEvent.altKey ? " alt " : "");
        // if (sourceEvent.type === 'mousemove' && control_pan_X) {
        //     // document.getElementById("logfile").innerHTML += sourceEvent.type + " [" + keys + "] " + SVG.state().svg.id + " to pan [" +
        //     // (zoom_X && zoom_Y ? "2D" : (zoom_X ? "X-AXIS" : "Y-AXIS")) + "] <br/>";
        // } else if (sourceEvent.type !== 'mousemove' && control_zoom_X) {
        //     // document.getElementById("logfile").innerHTML += sourceEvent.type + " [" + keys + "] " + SVG.state().svg.id + " to zoom [" +
        //     // (zoom_X && zoom_Y ? "2D" : (zoom_X ? "X-AXIS" : "Y-AXIS")) + "] <br/>";
        // }
        
        // marks.attr("transform", function() {
        //     let transform = this.__transform.match(/(-?\d+\.?-?\d*)/g);
            
        //     let t_x = (this.getBoundingClientRect().left - this._global_transform[0] - SVG.state().svg.getBoundingClientRect().left +
        //         this.getBoundingClientRect().right - this._global_transform[0] - SVG.state().svg.getBoundingClientRect().left) / 2;
        //     let t_y = (this.getBoundingClientRect().top - this._global_transform[1] - SVG.state().svg.getBoundingClientRect().top + 
        //         this.getBoundingClientRect().bottom - this._global_transform[1] - SVG.state().svg.getBoundingClientRect().top) / 2;

        //     if (!this._t) this._t = [t_x, t_y];
        //     let x_offset = +transform[0] === 0 ? 0 : +transform[0] - +this._t[0];
        //     let y_offset = +transform[1] === 0 ? 0 : +transform[1] - +this._t[1];

        //     let new_x = tx().applyX(+this._t[0]) + x_offset;
        //     let new_y = ty().applyY(+this._t[1]) + y_offset;

        //     let is_ellipse = this.nodeName === "path" && this.type !== "ellipse";
        //     let is_ordinal = SVG.state().x_axis.scale.domain().length > 2;
        //     if (is_ellipse || is_ordinal) {
        //         return 'translate(' + tx().x + ',' + ty().y + ') scale(' + tx().k + ',' + ty().k + ')';
        //     }

        //     return 'translate(' + (this.hasAttribute("cx") ? new_x - this.getAttribute("cx") : new_x) + ',' + (this.hasAttribute("cy") ? new_y - this.getAttribute("cy") : new_y) + ')';
        // });

        // marks.attr('vector-effect', 'non-scaling-stroke');

        // svg.selectAll(".hover").attr("display", "none");
        // let tooltips = document.querySelectorAll(".tooltip");
        // if (tooltips.length) tooltips.forEach(d => d.style['visibility'] = 'hidden');

        // SVG.updateBrush();

    // control.addEventListener('change', function() {
    //     if (this.checked) {
    svg.call(_zoom().on('zoom', zoomCallback)); //.on("mousedown.zoom", null).on("dblclick.zoom", null);
        // } else {
            // svg.call(d3.zoom().on("zoom", null));
        // }
    // });

    // axis_control.addEventListener('change', function(event) {
    //     console.log(event.id);
    // });
}
