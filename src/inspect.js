import { INTERACTION_CONSTANTS } from './constants.js';
import SVG from './SVG.js';
import { parseSVG } from 'svg-path-parser';
import { min, max } from 'd3-array';

function traverse_DOM_tree(element, SVG, transform) {
    if (element === null) {
        return;
    }

    if (element.nodeName === INTERACTION_CONSTANTS.SVG_TYPE.SVG_CONTAINER) {
        SVG.set_svg(element);
        // if (!SVG.get_svg().id) {
        //     SVG.get_svg().id = INTERACTION_CONSTANTS.SVG_TYPE.DEFAULT_ID;
        // }
    }

    element._global_transform = [...transform];
    if (element.nodeName === INTERACTION_CONSTANTS.SVG_TYPE.SVG_GROUP) {
        let t = element.getAttribute("transform");
        if (t) {
            transform[0] += +t.match(/(\d+\.?\d*)/g)[0];
            transform[1] += +t.match(/(\d+\.?\d*)/g)[1];
        }
    }

    if (element.className &&
        element.nodeName === INTERACTION_CONSTANTS.SVG_TYPE.SVG_GROUP && 
        element.className.animVal === INTERACTION_CONSTANTS.SVG_TYPE.SVG_TICK) {
        let x_shift = +element.getAttribute("transform").match(/(\d+)/g)[0];
        let y_shift = +element.getAttribute("transform").match(/(\d+)/g)[1];

        if (x_shift > 0 || (x_shift === 0 && y_shift === 0 && element.childNodes[1].hasAttribute("y"))) {
            SVG.add_x_axis_tick(element);

            if (typeof element.__data__ === "string") {
                SVG.add_x_ordinal(element.__data__);
            }

            let domain = SVG.get_x_axis_domain();

            domain[0] = (
                domain[0] == null ? element.__data__ : min([domain[0], element.__data__])
            );
            domain[1] = (
                domain[1] == null ? element.__data__ : max([domain[1], element.__data__])
            );
            SVG.set_x_axis_domain(domain);
        } else {
            SVG.add_y_axis_tick(element);

            if (typeof element.__data__ === "string") {
                SVG.add_y_ordinal(element.__data__);
            }

            let domain = SVG.get_y_axis_domain();

            domain[0] = (
                domain[0] == null ? element.__data__ : min([domain[0], element.__data__])
            );
            domain[1] = (
                domain[1] == null ? element.__data__ : max([domain[1], element.__data__])
            );
            SVG.set_y_axis_domain(domain);
        }
    }

    for (const mark_type of INTERACTION_CONSTANTS.SVG_TYPE.SVG_MARK) {
        if (element.nodeName === mark_type) {
            element.contour = null;

            if (mark_type === "path") {
                let commands = parseSVG(element.getAttribute("d"));

                if (commands.length) {
                    let start_cmd = commands[0];
                    let end_cmd = commands[commands.length - 1];

                    if (end_cmd.code === "Z" || (
                        end_cmd.code === "A" && end_cmd.x === start_cmd.x && end_cmd.y === start_cmd.y
                    )) {
                        element.contour = commands;
                        // element.contour = commands.map((d) => { return [d.x, d.y]; });
                        // element.contour[element.contour.length - 1] = element.contour[0];
                    }
                } 
            }

            if (element.className.animVal === INTERACTION_CONSTANTS.SVG_TYPE.TICK_DOMAIN) {
                SVG.set_domain(true);
            } else {
                // element.__mark__ = true;
                element.setAttribute("__mark__", "true");
                SVG.add_svg_mark(element);
                break;
            }
        }
    }
    
    for (const child of element.childNodes) {
        if (element.className && 
            element.className.animVal === INTERACTION_CONSTANTS.SVG_TYPE.SVG_TICK) {
            break;
        }
       
        traverse_DOM_tree(child, SVG, [...transform]);
    }
}

function inspect(element) {
    let svg = new SVG();
    traverse_DOM_tree(element, svg, [0, 0]);
    svg.infer_view();
    return svg;
}

export { inspect };
