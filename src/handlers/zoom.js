import { zoomTransform, zoom as _zoom, zoomIdentity } from '../_d3/zoom';
import { select, selectAll } from 'd3-selection';
import { Transform } from '../util/transform.js';

function addClipping(svg, marks, xAxis, yAxis) {
    svg.append('defs')
        .append('clipPath')
        .attr('id', 'clip-' + svg.node().id)
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', Math.abs(xAxis.range[1] - xAxis.range[0]))
        .attr('height', Math.abs(yAxis.range[0] - yAxis.range[1]));

    for (const node of marks.nodes()) {
        if (node.parentElement.hasAttribute('clip-path')) continue;
        let container = node.parentElement;
        if (container.id !== '_g_clip') {
            container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            container.id = '_g_clip';
            container.setAttribute('clip-path', 'url(#clip-' + svg.node().id + ')');

            node.parentElement.appendChild(container);
        }
        container.appendChild(node);
    }
}

const zoomCallback = (state, z, tx, ty, gXAxis, gYAxis, zoomX, zoomY) => function cb({ sourceEvent, transform }) {
    let { svg } = state;
    svg = select(svg);

    sourceEvent.preventDefault();

    const k = transform.k / z[0].k;
    const x = (transform.x - z[0].x) / tx().k;
    const y = (transform.y - z[0].y) / ty().k;

    const svgRect = svg.node().getBBoxCustom();
    const cliX = sourceEvent.clientX - svgRect.left;
    const cliY = sourceEvent.clientY - svgRect.top;

    if (k === 1) {
        gXAxis.call(zoomX.translateBy, x, 0);
        gYAxis.call(zoomY.translateBy, 0, y);
    } else {
        gXAxis.call(zoomX.scaleBy, k, [cliX, cliY]);
        gYAxis.call(zoomY.scaleBy, k, [cliX, cliY]);
    }
    for (const _s of [state]) {
        if (_s === state) _s.yAxis.axis.scale(ty().rescaleY(_s.yAxis.scale))();
        _s.xAxis.axis.scale(tx().rescaleX(_s.xAxis.scale))();

        selectAll(_s.svgMarks).attr('transform', function() {
            const translateX = tx().applyX(this.globalPosition.translate.x) - (this.globalPosition.translate.x);
            const translateY = _s === state ? ty().applyY(this.globalPosition.translate.y) - (this.globalPosition.translate.y) : 0;

            const scaleX = this.type ? tx().k : 1;
            const scaleY = this.type && _s === state ? ty().k : 1;

            return this.localTransform.getTransform(new Transform(translateX, translateY, scaleX, scaleY));
        });
    }
    z[0] = transform;
};

export function zoom(state) {
    const { xAxis, yAxis } = state;
    let { svg, svgMarks: marks } = state;
    svg = select(svg);
    marks = selectAll(marks);

    xAxis.axis.scale(xAxis.scale).ticks(xAxis.ticks.length)();
    yAxis.axis.scale(yAxis.scale).ticks(yAxis.ticks.length)();
    addClipping(svg, marks, xAxis, yAxis);

    const gXAxis = svg.append('g').attr('id', 'x-axis-zoom-accessor');
    const gYAxis = svg.append('g').attr('id', 'y-axis-zoom-accessor');

    const z = [zoomIdentity];
    const zoomX = _zoom();
    const zoomY = _zoom();
    const tx = () => zoomTransform(gXAxis.node());
    const ty = () => zoomTransform(gYAxis.node());

    gXAxis.call(zoomX).attr('pointer-events', 'none');
    gYAxis.call(zoomY).attr('pointer-events', 'none');

    svg.call(_zoom().on('zoom', zoomCallback(state, z, tx, ty, gXAxis, gYAxis, zoomX, zoomY)));
}
