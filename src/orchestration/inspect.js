import {
    SvgContainer, SvgGroup, Tick, TickDomain, Background, 
    Foreground, Axis, Circle, Ellipse, Line, Polygon, 
    Polyline, Rect, Path, Text
} from '../state/constants.js';

import { Transform } from '../util/transform.js';
import { ViewState } from '../state/view-state.js';
import { parseTransform } from '../util/attribute-parsers';
import * as parser from 'svg-path-parser';

const markTypes = [Circle, Ellipse, Line, Polygon, Polyline, Rect, Path];

function extractElementInformation(element, transform) {
    element.relativePosition = parseTransform(element);
    element.globalPosition = parseTransform(element, new Transform(transform));
    
    const clientRect = element.getBoundingClientRect();
    element.clientRect = {
        left: +clientRect.left,
        right: +clientRect.right,
        top: +clientRect.top,
        bottom: +clientRect.bottom
    }
}

function inferTypeFromPath(element) { 
    let commands = parser.parseSVG(element.getAttribute('d'));
    if (!commands.length) return;

    element.contour = commands;
    let endCmd = commands[commands.length - 1];

    if (commands.length === 3 && commands[1].code === 'A' && endCmd.code === 'A') {
        element.type = Ellipse;
    } else if (endCmd.code !== 'Z') {
        element.type = Line;
    } else {
        element.type = Polygon;
    }
}

function analyzeAxis(element, state, transform) {
    if (!element) return;
    if (element.className && (element.className.baseVal === Background || 
        element.className.baseVal === Foreground)) return;

    if (element.nodeName === SvgGroup) {
        parseTransform(element, transform);
    } else if (element.nodeName === Text) {
        extractElementInformation(element, transform);
        state.axisTextMarks.push(element);
        element.style['pointer-events'] = 'none';
        element.style['user-select'] = 'none';
    } else if (markTypes.includes(element.nodeName)) {
        extractElementInformation(element, transform);
        let isX = element.hasAttribute('x2') ? +element.getAttribute('x2') : 0;
        isX = !isX ? Math.abs(element.clientRect.bottom - element.clientRect.top) < 1 : isX;
        
        let isY = element.hasAttribute('y2') ? +element.getAttribute('y2') : 0;
        isY = !isY ? Math.abs(element.clientRect.left - element.clientRect.right) < 1 : isY;

        if (isX) state.yAxis.ticks.push(element);
        if (isY) state.xAxis.ticks.push(element);
    }

    for (const child of element.childNodes) {
        analyzeAxis(child, state, new Transform(transform));
    }
}

function analyzeDomTree(element, state, transform) {
    if (!element) return;
    if (element.className && (element.className.baseVal === Background || 
        element.className.baseVal === Foreground)) return;
    var skip = false;

    if (element.nodeName === SvgContainer) {
        extractElementInformation(element, transform);
        state.svg = element;
    } else if (element.nodeName === SvgGroup) {
        parseTransform(element, transform);

        let cName = element.className.baseVal;
        if (cName.includes(Tick) || cName.includes(Axis)) {/*cName.includes(Grid) || cName.includes(Label)) || c_name.includes("title")*/
            skip = true;
            for (const child of element.childNodes) {
                analyzeAxis(child, state, new Transform(transform));
            }
        }
    } else if (element.nodeName === Text) {
        extractElementInformation(element, transform);
        state.textMarks.push(element);
        element.style['pointer-events'] = 'none';
        element.style['user-select'] = 'none';
    } else if (markTypes.includes(element.nodeName)) {
        extractElementInformation(element, transform);
        const markType = element.nodeName;

        if (markType === Path) {
            // if (!element.hasAttribute('d')) continue;
            inferTypeFromPath(element);
        } else if (markType === Polyline) {
            element.type = Polyline
        }

        if (element.className && element.className.baseVal === TickDomain) {
            state.hasDomain = true;
        } else {
            element.setAttribute('__mark__', 'true');
            state.svgMarks.push(element);
        }
    }

    if (!skip) {
        for (const child of element.childNodes) {
            analyzeDomTree(child, state, new Transform(transform));
        }
    }
}

export function inspect(svg) {
    let state = new ViewState();
    analyzeDomTree(svg, state, new Transform());
    console.log(state);
    return state;
}
