import { INTERACTION_CONSTANTS } from './constants.js';

let svg_container = null;
let svg_groups = [];
let svg_marks = [];

function traverse(element) {
    if (element == null) {
        return;
    }

    if (element.nodeName == INTERACTION_CONSTANTS.SVG_TYPE.SVG_CONTAINER) {
        svg_container = element;
        if (!svg_container.hasAttribute("id")) {
            svg_container.setAttribute("id", "svg_plot");
        }
    }

    if (element.nodeName == INTERACTION_CONSTANTS.SVG_TYPE.SVG_GROUP) {
        svg_groups.push(element);
    }

    for (const mark_type of INTERACTION_CONSTANTS.SVG_TYPE.SVG_MARK) {
        if (element.nodeName == mark_type) {
            svg_marks.push(element);
            break;
        }
    }
    
    for (const child of element.childNodes) {
        traverse(child);
    }
}

function inspect(element) {
    
    traverse(element);
}

export { inspect, svg_container, svg_groups, svg_marks };
