import {
    SvgContainer, SvgGroup, TickDomain, Background, Foreground, Circle, Ellipse, Line, Polygon, 
    Polyline, Rect, Path, Text, DefaultSvgId, MarkRole
} from '../state/constants.js';

import { Transform } from '../util/transform.js';
import { ViewState } from '../state/view-state.js';
import { parseTransform } from '../parsers/attribute-parsers';
import * as parser from 'svg-path-parser';
import { SVGToScreen } from '../util/util.js';

const markTypes = [Circle, Ellipse, Line, Polygon, Polyline, Rect, Path];
var id = 1;

function extractElementInformation(svg, element, transform) {
    element._getBBox = element.nodeName === SvgContainer 
        ? function() { return this.getBoundingClientRect(); } 
        : function() {
            const clientRect = this.getBoundingClientRect(), svgRect = this.getBBox();
            const p1 = SVGToScreen(svg, this, svgRect.x, svgRect.y)
            const p2 = SVGToScreen(svg, this, svgRect.x + svgRect.width, svgRect.y + svgRect.height);
            const width = Math.abs(p1.x - p2.x), height = Math.abs(p1.y - p2.y);
            const left = clientRect.left + clientRect.width / 2 - width / 2, 
                top = clientRect.top + clientRect.height / 2 - height / 2;

            return {
                width: width,
                height: height,
                left: left,
                right: left + width,
                top: top,
                bottom: top + height,
                centerX: left + width / 2,
                centerY: top + height / 2
            }
      }

    element.localTransform = parseTransform(element, false);
    element.globalPosition = parseTransform(element, true, new Transform(transform));
}

function inferTypeFromPath(element) { 
    let commands = parser.parseSVG(element.getAttribute('d'));
    if (!commands.length) return;

    element.contour = commands;
    let endCmd = commands[commands.length - 1];
    const relCommands = ['v', 'h'];

    if (commands.length === 3 && commands[1].code === 'A' && endCmd.code === 'A') {
        element.type = Ellipse;
    } else if (endCmd.code !== 'Z') {
        element.type = Line;
    } else if (commands.length === 5 && relCommands.includes(commands[1].code) && relCommands.includes(commands[2].code) && 
        relCommands.includes(commands[3].code)) {
            element.type = Rect;
    } else {
        element.type = Polygon;
    }
}

function analyzeDomTree(element, state, transform) {
    if (!element) return;
    if (element.className && (element.className.baseVal === Background || 
        element.className.baseVal === Foreground)) return;

    if (element.nodeName === SvgContainer) {
        state.svg = element;
        extractElementInformation(state.svg, element, transform);
        if (!element.id) element.id = DefaultSvgId + '-' + id++;
    } else if (element.nodeName === SvgGroup) {
        parseTransform(element, true, transform);
    } else if (element.nodeName === Text) {
        extractElementInformation(state.svg, element, transform);
        element.removeAttribute('textLength');
        state.textMarks.push(element);
        element.style['pointer-events'] = 'none';
        element.style['user-select'] = 'none';
    } else if (markTypes.includes(element.nodeName)) {
        extractElementInformation(state.svg, element, transform);
        const markType = element.nodeName;

        if (markType === Path) {
            inferTypeFromPath(element);
            element.setAttribute('vector-effect', 'non-scaling-stroke');
        } else if (markType === Polyline || markType === Polygon || markType === Line) {
            element.type = markType;
            element.setAttribute('vector-effect', 'non-scaling-stroke');
        }

        if (element.className && element.className.baseVal === TickDomain) {
            state.hasDomain = true;
        } else {
            element.setAttribute(MarkRole, 'true');
            state.svgMarks.push(element);
        }
    }

    for (const child of element.childNodes) {
        analyzeDomTree(child, state, new Transform(transform));
    }
}

export function inspect(svg) {
    let state = new ViewState();
    analyzeDomTree(svg, state, new Transform());
    console.log(state);
    return state;
}
