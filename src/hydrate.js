import { inspect } from './inspect.js';
import { INTERACTION_CONSTANTS } from './constants.js';

function add_interactions(checkbox, SVG) {
    for (const [key, value] of Object.entries(SVG.state().interactions)) {
        value.control = document.querySelector("#" + key);
        const axis_control = document.querySelector("#" + key + "_axis");
        if (axis_control) value.axis_control = axis_control;
    }
    return SVG;
}

export function hydrate(svg_id, checkbox_id) {
    let svg = document.querySelector(svg_id);
    if (!svg) return;
    
    let checkbox = document.querySelector(checkbox_id);
    let SVG = inspect(svg);
    add_interactions(checkbox, SVG).hydrate();
}
