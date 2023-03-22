import {
    SvgContainer, SvgGroup, Background, Foreground, Circle, Ellipse, Line, Polygon, 
    Polyline, Rect, Path, Text, DefaultSvgId, MarkRole, Use, Width, Height, Left, Right, 
    Top, Bottom, CenterX, CenterY, TextRef, Style
} from '../state/constants.js';

import { Transform } from '../util/transform.js';
import { ViewState } from '../state/view-state.js';
import { parseTransform } from '../parsers/attribute-parsers';
import * as parser from 'svg-path-parser';
import { SVGToScreen } from '../util/util.js';
import { select } from 'd3-selection';

const markTypes = [Circle, Ellipse, Line, Polygon, Polyline, Rect, Path, Use];
var id = 1;

function extractElementInformation(svg, element, transform, parent=false) {
    element._getBBox = parent ? function() { return this.getBoundingClientRect(); } 
        : function() {
            const clientRect = this.getBoundingClientRect(), svgRect = this.getBBox ? this.getBBox() : clientRect;

            const p1 = this.getBBox ? SVGToScreen(svg, this, svgRect.x, svgRect.y) 
                : { x: svgRect.x, y: svgRect.y };
            const p2 = this.getBBox ? SVGToScreen(svg, this, svgRect.x + svgRect.width, svgRect.y + svgRect.height) 
                : { x: svgRect.x + svgRect.width, y: svgRect.y + svgRect.height };
            const width = Math.abs(p1.x - p2.x), height = Math.abs(p1.y - p2.y);
            const left = clientRect.left + clientRect.width / 2 - width / 2, 
                top = clientRect.top + clientRect.height / 2 - height / 2;

            return {
                [Width]: width,
                [Height]: height,
                [Left]: left,
                [Right]: left + width,
                [Top]: top,
                [Bottom]: top + height,
                [CenterX]: left + width / 2,
                [CenterY]: top + height / 2
            }
    };
    
    if (element.transform) {
        element.localTransform = parseTransform(element, false);
        element.globalPosition = parseTransform(element, true, new Transform(transform));
    }
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

function analyzeDomTree(element, state, transform, parent=false) {
    if (!element) return;
    if (element.nodeName.toLowerCase() === Style) return;
    if (element.className && (element.className.baseVal === Background || 
        element.className.baseVal === Foreground)) return;

    if (parent || element.nodeName === SvgContainer) {
        state.svg = element;
        extractElementInformation(state.svg, element, transform, parent);
        if (!element.id) element.id = DefaultSvgId + '-' + id++;
    } else if (element.nodeName === SvgGroup) {
        parseTransform(element, true, transform);
    } else if (element.nodeName === TextRef && element.textContent.trim() !== '') {
        let el = element.parentElement;
        if (el.nodeName !== Text) {
            el = select(el).append('text').html(element.textContent).node();
            select(element).remove();
        }
        // } else if (window.getComputedStyle(el).opacity === 0 || +el.getAttribute('opacity') === 0) return;

        extractElementInformation(state.svg, el, transform);
        el.removeAttribute('textLength');
        state.textMarks.push(el);
        el.style['pointer-events'] = 'none';
        el.style['user-select'] = 'none';
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

        element.setAttribute(MarkRole, 'true');
        state.svgMarks.push(element);
    }

    for (const child of element.childNodes) {
        analyzeDomTree(child, state, new Transform(transform));
    }
}

export function inspect(svg) {
    let state = new ViewState();
    analyzeDomTree(svg, state, new Transform(), true);
    state.svg = svg;
    console.log(state);
    return state;
}
