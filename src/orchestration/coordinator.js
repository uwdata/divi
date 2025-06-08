import { inspect } from './inspect.js';
import { getRootNodes, link, walkQueryPath } from '../parsers/multi-view/link-parser.js';
import { parseChart } from '../parsers/engine/parser-engine.js';
// import { createMenu } from '../toolbar/menu.js';
import { applySelections, selectPoint } from '../handlers/select.js';
import { isMetaKey } from '../util/util.js';
import { zoom } from '../handlers/zoom.js';
import { brush } from '../handlers/brush.js';

export function coordinate(svg, extState) {
    const states = svg.map(d => parseChart(inspect(d)));
    link(states, extState);
    // createMenu(states);
    coordinateInteractions(states);
    return states;
}

function coordinateInteractions(states) {
    const select = state => function(event) {
        const { target } = event;
        const { data } = state;
        const roots = getRootNodes(data);

        walkQueryPath(roots, selectPoint(state, target), isMetaKey(event));
        applySelections(states);
    };

    for (const state of states) {
        const { svg } = state;
        svg.addEventListener('click', select(state));
        // zoom(state);
        brush(state);
    }
}
