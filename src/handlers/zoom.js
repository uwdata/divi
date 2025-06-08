import { zoomTransform, zoom as _zoom, zoomIdentity } from '../_d3/zoom';
import { select, selectAll } from 'd3-selection';
import { Transform } from '../util/transform.js';
import { MarkRole } from '../state/constants.js';

function addClipping(svg, marks, xAxis, yAxis) {
    const nodes = marks.nodes();
    if (nodes.length === 0) return;

    // Find shared parent of all nodes
    let sharedParent = nodes[0].parentElement;
    if (!sharedParent) return;

    for (let i = 1; i < nodes.length; ++i) {
        const current = nodes[i].parentElement;
        if (!current) continue;

        if (current.contains(sharedParent)) {
            sharedParent = current;
        } else {
            while (!sharedParent.contains(current)) {
                sharedParent = sharedParent.parentElement;
            }
        }
    }

    xAxis.range = xAxis.range.map(d => d - (sharedParent.localTransform?.translate.x || 0));
    yAxis.range = yAxis.range.map(d => d - (sharedParent.localTransform?.translate.y || 0));

    svg.append('defs')
        .append('clipPath')
        .attr('id', 'clip-' + svg.node().id)
        .append('rect')
        .attr('x', xAxis.range[0])
        .attr('y', yAxis.range[1])
        .attr('width', xAxis.range[1] - xAxis.range[0])
        .attr('height', yAxis.range[0] - yAxis.range[1]);

    const container = select(sharedParent).append('g');
    container.attr('clip-path', 'url(#clip-' + svg.node().id + ')');

    for (const child of [...sharedParent.children]) {
        if (child.hasAttribute(MarkRole)) {
            container.node().appendChild(child);
        }
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
