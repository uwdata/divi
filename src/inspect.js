import { INTERACTION_CONSTANTS } from './constants.js';
import SVG from './SVG.js';
import { parseSVG } from 'svg-path-parser';

function inferTypeFromPath(element) { 
    let commands = parseSVG(element.getAttribute("d"));
    if (!commands.length) return;

    element.contour = commands;
    let endCmd = commands[commands.length - 1];

    if (commands.length === 3 && commands[1].code === "A" && endCmd.code === "A") {
        element.type = "ellipse";
    } else if (endCmd.code !== "Z") {
        element.type = "line";
    } else {
        element.type = "polygon";
    }
}

function analyzeAxis(element, SVG, transform) {
    element._global_transform = [...transform];

    if (element.nodeName === INTERACTION_CONSTANTS.SVG_TYPE.SVG_GROUP) {
        let t = element.getAttribute("transform");
        if (t) {
            transform[0] += +t.match(/(\d+\.?\d*)/g)[0];
            transform[1] += +t.match(/(\d+\.?\d*)/g)[1];
        }
    } else {
        if (element.nodeName === "text") {
            SVG.state().axis_text_marks.push(element);
            element.style['pointer-events'] = 'none'
            element.style['user-select'] = 'none'
        } else {
            for (const mark_type of INTERACTION_CONSTANTS.SVG_TYPE.SVG_MARK) {
                if (element.nodeName === mark_type) {
                    let is_x = element.hasAttribute("x2") ? +element.getAttribute("x2") : 0;
                    is_x = !is_x ? Math.abs((+element.getBoundingClientRect().bottom - +element.getBoundingClientRect().top)) < 1 : is_x;
                    
                    let is_y = element.hasAttribute("y2") ? +element.getAttribute("y2") : 0;
                    is_y = !is_y ? Math.abs((+element.getBoundingClientRect().left - +element.getBoundingClientRect().right)) < 1 : is_y;

                    if (is_x) SVG.state().y_axis.ticks.push(element);
                    if (is_y) SVG.state().x_axis.ticks.push(element);
                }
            }
        }
    }

    for (const child of element.childNodes) {
        analyzeAxis(child, SVG, [...transform]);
    }
}

function analyzeDomTree(element, SVG, transform) {
    if (element === null) {
        return;
    }

    var skip = false;
    element._global_transform = [...transform];

    if (element.nodeName === INTERACTION_CONSTANTS.SVG_TYPE.SVG_CONTAINER) {
        SVG.state().svg = element;
    }

    if (element.nodeName === INTERACTION_CONSTANTS.SVG_TYPE.SVG_GROUP) {
        let t = element.getAttribute("transform");
        if (t) {
            transform[0] += +t.match(/(\d+\.?\d*)/g)[0];
            transform[1] += +t.match(/(\d+\.?\d*)/g)[1];
        }

        let c_name = element.className.animVal;
        if (c_name.includes("legend")) {
            // skip = true;
        } else if (c_name.includes("tick") || c_name.includes("grid") ||  c_name.includes("label") /*|| c_name.includes("title")*/) {
            skip = true;
            for (const child of element.childNodes) {
                analyzeAxis(child, SVG, [...transform]);
            }
        }
    } else {
        let added = false;
        for (const mark_type of INTERACTION_CONSTANTS.SVG_TYPE.SVG_MARK) {
            if (element.nodeName === "text") {
                element.style['pointer-events'] = 'none';
                element.style['user-select'] = 'none'
                if (!added) {
                    SVG.state().text_marks.push(element);
                    added = true;
                }
            }

            if (element.className && (element.className.animVal === "background" || element.className.animVal === "foreground")) {
                break;
            }

            if (element.nodeName === mark_type) {
                if (mark_type === "path") {
                    if (!element.hasAttribute("d")) break;
                    inferTypeFromPath(element);
                } else if (mark_type === "polyline") {
                    element.type = "polyline"
                }

                if (element.className && element.className.animVal === INTERACTION_CONSTANTS.SVG_TYPE.TICK_DOMAIN) {
                    SVG.state().has_domain = true;
                } else {
                    element.setAttribute("__mark__", "true");
                    element.__transform = element.hasAttribute("transform") ? element.getAttribute("transform") : "translate(0, 0)";
                    SVG.state().svg_marks.push(element);
                }

                break;
            }
        }
    }

    if (!skip) {
        for (const child of element.childNodes) {
            analyzeDomTree(child, SVG, [...transform]);
        }
    }
}

function inspect(element) {
    let svg = new SVG();
    analyzeDomTree(element, svg, [0, 0], false);
    svg.analyze_axes().infer_view().infer_mark_attributes();
    console.log(svg.state());
    return svg;
}

export { inspect };
