import { applySelections, selectPoint } from '../handlers/select.js';
// import { brush } from '../handlers/brush.js';
// import { zoom } from '../handlers/zoom.js';
// import { sort } from '../handlers/sort.js';
// import { annotate } from '../handlers/annotate.js';

import { deconstructChart } from '../parsers/parser-engine.js';
import { inferMarkAttributes } from '../parsers/attribute-parsers.js';
// import { createMenu } from '../toolbar/menu.js';
import { parseDataFromMarks } from '../parsers/dataset-parser.js';
import { inspect } from './inspect.js';
import { getRootNodes, link, walkQueryPath } from '../parsers/link-parsers.js';
import { isMetaKey } from '../util/util.js';
import { pointer } from 'd3-selection';
// import { zoom } from '../handlers/zoom.js';
import { brushEnd, brushMove, brushStart } from '../handlers/brush.js';
import { generateBrushPredicates } from '../handlers/query.js';

export function coordinate(svg, extState) {
    const states = svg.map(d => initialize(inspect(d)));
    link(states, extState);
    // createMenu(states);
    states.forEach(d => coordinateInteractions(d));

    function initialize(state) {
        // state.svg.style.cursor = 'crosshair';
        // Infer view information
        deconstructChart(state);
        // highlight(state);
        inferMarkAttributes(state);
        state.data = parseDataFromMarks(state.svgMarks);
        return state;
    }
    // console.log(extState);
    // function highlight(state) {
    //     state.xAxis.ticks.forEach(d => select(d.label).style('color', '#e15759'));
    //     state.xAxis.ticks.forEach(d => d.marks.forEach(e => select(e).style('color', '#e15759')));
    //     state.xAxis.ticks.forEach(d => select(d.marks[0]).style('stroke-opacity', 0.2));

    //     state.yAxis.ticks.forEach(d => select(d.label).style('color', '#4e79a7'));
    //     state.yAxis.ticks.forEach(d => d.marks.forEach(e => select(e).style('color', '#4e79a7')));
    //     state.yAxis.ticks.forEach(d => select(d.marks[0]).style('stroke-opacity', 0.2));

    //     select(state.xAxis.title).style('color', '#f28e2c');
    //     select(state.yAxis.title).style('color', '#f28e2c');

    //     state.svgMarks.forEach(d => select(d).style('stroke', 'black'));

    //     state.legends.forEach(d => {
    //         d.marks.forEach(e => {
    //             select(e.label).style('color', '#76b7b2');
    //             select(e.mark).style('fill', '#76b7b2');
    //         });
    //     });
    // }

    function coordinateInteractions(state) {
        const { data } = state; const roots = getRootNodes(data);
        let mouseMoved = false;

        function selector(event) {
            if (mouseMoved) return;
            const { target } = event;
            walkQueryPath(roots, selectPoint(state, target), isMetaKey(event));
            applySelections(states);
        }

        // function propogateSelection(e, brushedMarks) {
        //     function render(marks, isVertical) {
        //         for (const [mark, data] of marks) {
        //             // console.log(data)
        //             const markRect = mark._getBBox();

        //             if (mark.tagName === Path) {
        //                 const x = mark.contour[0].x, y = mark.contour[0].y;
        //                 const w = isVertical ? markRect.width : data;
        //                 const h = isVertical ? -data : markRect.height;

        //                 const p = path();
        //                 p.rect(x, y, w, h);
        //                 mark.setAttribute('d', p.toString());
        //             }
        //         }
        //     }

        //     if (linkMap.has(e)) {
        //         const encodings = linkMap.get(e);
        //         for (const _e of encodings) {
        //             const {encoding, groupBy, matchBy, fn, state: encodingState} = _e;
        //             const allKeys = Array.from(group(state.svgMarks, d => d.__inferred__data__[groupBy]).keys());
        //             const groups = group(brushedMarks, d => d.__inferred__data__[groupBy]);

        //             const newMarks = [];
        //             for (const key of allKeys) {
        //                 const mark = encodingState.svgMarks.filter(function(d) {
        //                     for (const [_, val] of Object.entries(d.__inferred__data__)) {
        //                         if (val === key) return true;
        //                     }
        //                     return false;
        //                 })[0];

        //                 if (!groups.has(key)) {
        //                     var data = encoding.domain[0];
        //                 } else {
        //                     var data = AGGREGATIONS[fn](groups.get(key).map(d => d.__inferred__data__[matchBy]));
        //                 }
        //                 newMarks.push([mark, encoding.scale(data) - encoding.range[0]]);
        //             }

        //             render(newMarks, encoding === encodingState.yAxis);
        //         }
        //     }
        // }

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

        state.svg.addEventListener('click', selector);
        // zoom(state, states);
        state.svg.addEventListener('mousedown', brusher);
    }

    return states;
}
