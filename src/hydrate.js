import { inspect } from './inspect.js';

function addInteractions(SVG) {
    for (const [key, value] of Object.entries(SVG.state().interactions)) {
        value.control = document.querySelector("#" + key);
        const axis_control = document.querySelector("#" + key + "_axis");
        if (axis_control) value.axis_control = axis_control;
    }
    return SVG;
}

export function hydrate(svg) {
    if (typeof svg === "string") svg = document.querySelector(svg);
    if (svg) addInteractions(inspect(svg)).hydrate();
}
