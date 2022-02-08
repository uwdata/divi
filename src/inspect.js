import { INTERACTION_CONSTANTS } from './constants.js';

function traverse_DOM_tree(element, svg_objects) {
    if (element == null) {
        return;
    }

    if (element.nodeName == INTERACTION_CONSTANTS.SVG_TYPE.SVG_CONTAINER) {
        svg_objects.svg = element;
        if (!svg_objects.svg.id) {
            svg_objects.svg.id = INTERACTION_CONSTANTS.SVG_TYPE.DEFAULT_ID;
        }
    }

    if (element.className &&
        element.nodeName == INTERACTION_CONSTANTS.SVG_TYPE.SVG_GROUP && 
        element.className.animVal == INTERACTION_CONSTANTS.SVG_TYPE.SVG_TICK) {
        if (element.getAttribute("transform").match(/(\d+)/g)[0] > 0) {
            svg_objects.x_axis.ticks.push(element);
            svg_objects.x_axis.domain[0] = (
                svg_objects.x_axis.domain[0] == null ? 
                element.__data__ :
                d3.min([svg_objects.x_axis.domain[0], element.__data__])
            );
            svg_objects.x_axis.domain[1] = (
                svg_objects.x_axis.domain[1] == null ? 
                element.__data__ :
                d3.max([svg_objects.x_axis.domain[1], element.__data__])
            );
        } else {
            svg_objects.y_axis.ticks.push(element);
            svg_objects.y_axis.domain[0] = (
                svg_objects.y_axis.domain[0] == null ? 
                element.__data__ :
                d3.min([svg_objects.y_axis.domain[0], element.__data__])
            );
            svg_objects.y_axis.domain[1] = (
                svg_objects.y_axis.domain[1] == null ? 
                element.__data__ :
                d3.max([svg_objects.y_axis.domain[1], element.__data__])
            );
        }
    }

    for (const mark_type of INTERACTION_CONSTANTS.SVG_TYPE.SVG_MARK) {
        if (element.nodeName == mark_type) {
            if (element.className.animVal == INTERACTION_CONSTANTS.SVG_TYPE.TICK_DOMAIN) {
                svg_objects.has_domain = true;
            } else {
                // element.__mark__ = true;
                element.setAttribute("__mark__", "true");
                svg_objects.svg_marks.push(element);
                break;
            }
        }
    }
    
    for (const child of element.childNodes) {
        if (element.className && 
            element.className.animVal == INTERACTION_CONSTANTS.SVG_TYPE.SVG_TICK) {
            break;
        }
       
        traverse_DOM_tree(child, svg_objects);
    }
}

function inspect(element) {
    let svg_objects = {
        has_domain: false,
        svg: null,
        svg_marks: [],
        x_axis: {
            domain: [null, null],
            ticks: []
        },
        y_axis: {
            domain: [null, null],
            ticks: []
        } 
    }

    traverse_DOM_tree(element, svg_objects);
    return svg_objects;
}

export { inspect };
