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


function brusher(event) {
    let x1, x2, y1, y2;
    function bMove(event) {
        event.stopPropagation();
        event.preventDefault();
        // filter(
        //     state,
        //     +rect.getAttribute("x") + +svg.getBoundingClientRect().left + x_translate,
        //     +rect.getAttribute("y") + +svg.getBoundingClientRect().top + y_translate,
        //     Math.abs(+rect.getAttribute("width")),
        //     Math.abs(+rect.getAttribute("height")),
        //     e.ctrlKey || e.metaKey || e.altKey || e.shiftKey
        // );
        const mousePos = pointer(event);
        if (Math.hypot(mouseStart[0] - mousePos[0], mouseStart[1] - mousePos[1]) < 5) return;
        mouseMoved = true;

        const [x, y, width, height] = brushMove(state, event);
        x1 = state.xAxis.scale.invert(x);
        x2 = state.xAxis.scale.invert(x + width);
        y1 = state.yAxis.scale.invert(y);
        y2 = state.yAxis.scale.invert(y + height);
        // brushedMarks = state.svgMarks.filter(function(d) {
        //     const xField = d.__inferred__data__[state.xAxis.title.innerHTML];
        //     const yField = d.__inferred__data__[state.yAxis.title.innerHTML];
        //     return xField >= min([x1, x2]) && xField <= max([x1, x2]) && yField >= min([y1, y2]) && yField <= max([y1, y2]);
        // });
    }

    function bEnd(event) {
        brushEnd(state, event);
        if (mouseMoved) {
            const p = generateBrushPredicates(state.xAxis.title.innerHTML.toLowerCase(),
                state.yAxis.title.innerHTML.toLowerCase(), [x1, x2], [y1, y2]);
            walkQueryPath(roots, p, isMetaKey(event));
            applySelections(states);
        }
        // selectMarks(state.svgMarks, brushedMarks);
        // propogateSelection(state.xAxis, brushedMarks);
        state.svg.removeEventListener('mousemove', bMove);
        state.svg.removeEventListener('mouseup', bEnd);
    }

    mouseMoved = false;
    const mouseStart = pointer(event);

    if (!state.interactions.brush) return;
    brushStart(state, event);
    state.svg.addEventListener('mousemove', bMove);
    state.svg.addEventListener('mouseup', bEnd);
}
