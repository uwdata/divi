import { pointer, select } from 'd3-selection';

function getBrusher(svg) {
    return select(svg)
        .append('rect')
        .attr('opacity', 0.25)
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 0)
        .attr('height', 0)
        .attr('id', svg.id + '-brush-rect')
        .style('fill', 'gray')
        .style('stroke', '#fff')
        .style('stroke-width', '1px');
}

export function brush(state) {
    const { svg } = state;
    let brusher, x, y;

    function brushStart(event) {
        event.preventDefault();

        brusher = getBrusher(svg);
        [x, y] = pointer(event, svg);
        brusher.attr('x', x)
            .attr('y', y);

        svg.addEventListener('mousemove', brushMove);
        svg.addEventListener('mouseup', brushEnd);
    }

    function brushMove(event) {
        event.preventDefault();

        const [newX, newY] = pointer(event, svg);
        const width = newX - x;
        const height = newY - y;
        const xTranslate = width < 0 ? width : 0;
        const yTranslate = height < 0 ? height : 0;

        brusher.attr('width', Math.abs(width))
            .attr('height', Math.abs(height))
            .attr('transform', 'translate(' + xTranslate + ',' + yTranslate + ')');
    }

    function brushEnd(_) {
        svg.removeEventListener('mousemove', brushMove);
        svg.removeEventListener('mouseup', brushEnd);
        brusher.remove();
    }

    svg.addEventListener('mousedown', brushStart);
}
