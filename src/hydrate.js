import { zoom } from './zoom.js';
import { brush } from './brush.js';
import { filter } from './filter.js';
import { sort } from './sort.js';
import { select } from './select.js';
import { hover, mouseover, mouseleave } from './hover.js';
import { inspect } from './inspect.js';
import { INTERACTION_CONSTANTS } from './constants.js';

function add_control_callbacks() {

}

function add_interactions(id, checkbox_id, svg_objects) {
    let t = svg_objects;
    let flag = document.getElementById("Zoom");
    flag.addEventListener('change', function() {
        if (this.checked) {
            zoom(id, svg_objects);
        }
        else {
            let svg = d3.select(id);
            svg.call(d3.zoom().on("zoom", null));
        }
    });

    let b_flag = document.getElementById("Brush");
    b_flag.addEventListener('change', function() {
        if (this.checked) {
            brush(id);
        }
        else {
            let svg = d3.select(id);
            svg.call(d3.brush().on("brush", null));
        }
    })

    let h_flag = document.getElementById("Selection");
    h_flag.addEventListener('change', function() {
        if (this.checked) {
            hover();
        }
        else {
            for (const mark of svg_marks) {
                mark.removeEventListener('mouseover', mouseover);
            }
        }
    });

    let f_flag = document.getElementById("Filter");
    f_flag.addEventListener('input', function(event) {
        filter(event.target.value);
    });

    // zoom(id);
    // brush(id);
    // hover();
}

export function hydrate(svg_id, checkbox_id) {
    const svg = document.querySelector(svg_id);
    let svg_objects = inspect(svg);
    add_interactions(svg_id, checkbox_id, svg_objects);
}
