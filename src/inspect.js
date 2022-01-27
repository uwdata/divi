
function traverse(element) {
    if (element == null) {
        return;
    }

    if (element.nodeName == INTERACTION_CONSTANTS.SVG_TYPE.SVG_CONTAINER) {
        svg_container = el;
        if (!svg_container.hasAttribute("id")) {
            svg_container.setAttribute("id", "svg_plot");
        }
    }

    if (element.nodeName == INTERACTION_CONSTANTS.SVG_TYPE.SVG_GROUP) {
        svg_groups.push(el);
    }

    for (const mark_type of INTERACTION_CONSTANTS.SVG_TYPE.SVG_MARK) {
        if (element.nodeName == mark_type) {
            svg_marks.push(element);
            break;
        }
    }
    
    for (const child of element.childNodes) {
        walk_svg(child);
    }
}

export function inspect(element) {
    
}
