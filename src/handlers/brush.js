import { pointer, select } from 'd3-selection';

let brush;

function getBrush(svg) {
    return select(svg)
        .append('rect')
        .attr('opacity', 0.35)
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 0)
        .attr('height', 0)
        .attr('id', svg.id + '-brush-rect')
        .style('fill', 'gray')
        .style('stroke', '#fff');
}

export function brushStart(state, event) {
    brush = getBrush(state.svg);
    const [x, y] = pointer(event, state.svg);
    brush.attr('x', x)
        .attr('y', y);
}

export function brushMove(state, event) {
    event.preventDefault();

    const [x, y] = pointer(event, state.svg);
    const rectX = +brush.node().getAttribute('x'); const rectY = +brush.node().getAttribute('y');
    const width = x - rectX; const height = y - rectY;
    const xTranslate = width < 0 ? width : 0;
    const yTranslate = height < 0 ? height : 0;

    brush.attr('width', Math.abs(width))
        .attr('height', Math.abs(height))
        .attr('transform', 'translate(' + xTranslate + ',' + yTranslate + ')');
    return [rectX, rectY, width, height];
}

export function brushEnd(event) {
    brush.remove();
}
