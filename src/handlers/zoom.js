import { zoomTransform, zoom as _zoom, zoomIdentity } from '../_d3/zoom.js';
import { select, selectAll } from 'd3-selection';
import { Line, Polygon, Polyline } from '../state/constants.js';
import { Transform } from '../util/transform.js';

export function zoom(state, states) {
    const svg = select(state.svg);
    console.log(state.xAxis.scale.domain(), state.xAxis.scale.range());
    if (state.xAxis.ordinal.length || state.yAxis.ordinal.length) return;
    if (state.xAxis.scale && !state.xAxis.ordinal.length) state.xAxis.axis.scale(state.xAxis.scale).ticks(state.xAxis.ticks.length)();
    if (state.yAxis.scale && !state.yAxis.ordinal.length) state.yAxis.axis.scale(state.yAxis.scale).ticks(state.yAxis.ticks.length)();
    console.log(state.xAxis.scale.domain(), state.xAxis.scale.range());
    const marks = selectAll(state.svgMarks);
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

    // const left_bound = state.svg.getBoundingClientRect().left; const top_bound = state.svg.getBoundingClientRect().top;
    const gXAxis = svg.append('g').attr('id', 'x-axis-zoom-accessor'); const gYAxis = svg.append('g').attr('id', 'y-axis-zoom-accessor');

    let z = zoomIdentity;
    const zoomX = _zoom(); const zoomY = _zoom();
    const tx = () => zoomTransform(gXAxis.node());
    const ty = () => zoomTransform(gYAxis.node());
    gXAxis.call(zoomX).attr('pointer-events', 'none');
    gYAxis.call(zoomY).attr('pointer-events', 'none');

    function zoomCallback({ sourceEvent, transform }) {
        if (!state.interactions.navigate) return;

        // const zoom_X = sourceEvent.clientX - left_bound > state.xAxis.range[0];
        // const zoom_Y = sourceEvent.clientY - top_bound < state.yAxis.range[0];

        sourceEvent.preventDefault();

        const k = transform.k / z.k;
        const x = (transform.x - z.x) / tx().k;
        const y = (transform.y - z.y) / ty().k;

        // if (!state.xAxis.axis && !state.yAxis.axis) {
        const svgRect = state.svg._getBBox();
        const cliX = sourceEvent.clientX - svgRect.left;
        const cliY = sourceEvent.clientY - svgRect.top;
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
            gXAxis.call(zoomX.translateBy, x, 0);
            gYAxis.call(zoomY.translateBy, 0, y);
        } else {
            gXAxis.call(zoomX.scaleBy, k, [cliX, cliY]);
            gYAxis.call(zoomY.scaleBy, k, [cliX, cliY]);
        }
        for (const _s of states) {
            if (_s === state) _s.yAxis.axis.scale(ty().rescaleY(_s.yAxis.scale))();
            _s.xAxis.axis.scale(tx().rescaleX(_s.xAxis.scale))();
            // marks.attr('transform', 'translate(' + tx().x + ',' + ty().y + ') scale(' + tx().k + ',' + ty().k + ')');

            selectAll(_s.svgMarks).attr('transform', function() {
                const lineChart = this.type && (this.type === Line || this.type === Polygon || this.type === Polyline);

                // if (this.type === Polygon || this.type === Polyline) {
                //     this.globalPosition.translate.x = this.clientRect.left; + this.clientRect.width / 2;
                //     this.globalPosition.translate.y = this.clientRect.top + this.clientRect.height / 2;
                // }

                const translateX = tx().applyX(this.globalPosition.translate.x) - (this.globalPosition.translate.x);
                // const translateY = this.type && lineChart ? 0
                const translateY = _s === state ? ty().applyY(this.globalPosition.translate.y) - (this.globalPosition.translate.y) : 0;
                const scaleX = this.type && lineChart ? tx().k : 1;
                const scaleY = this.type && lineChart && _s === state ? ty().k : 1;

                return this.localTransform.getTransform(new Transform(translateX, translateY, scaleX, scaleY));
            });
        }

        // svg.selectAll('text').attr('transform','translate(' + tx().x + ',' + ty().y + ') scale(' + tx().k + ',' + ty().k + ')');
        // }
        z = transform;
    }
    svg.call(_zoom().on('zoom', zoomCallback)); // .on("mousedown.zoom", null).on("dblclick.zoom", null);
}
