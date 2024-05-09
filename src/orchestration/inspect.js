import {
    SvgContainer, SvgGroup, Background, Foreground, Circle, Ellipse, Line, Polygon,
    Polyline, Rect, Path, Text, DefaultSvgId, MarkRole, Use, Width, Height, Left, Right,
    Top, Bottom, CenterX, CenterY, TextRef, Style
} from '../state/constants.js';

import { Transform } from '../util/transform.js';
import { ViewState } from '../state/view-state.js';
import { parseTransform } from '../parsers/attribute-parsers.js';
import * as parser from 'svg-path-parser';
import { SVGToScreen, containsLines } from '../util/util.js';
import { select } from 'd3-selection';

const markTypes = [Circle, Ellipse, Line, Polygon, Polyline, Rect, Path, Use];
let id = 1;

function extractElementInformation(svg, element, transform, parent = false) {
    element._getBBox = parent
        ? function() { return this.getBoundingClientRect(); }
        : function() {
            const clientRect = this.getBoundingClientRect(); const svgRect = this.getBBox ? this.getBBox() : clientRect;

            const p1 = this.getBBox
                ? SVGToScreen(svg, this, svgRect.x, svgRect.y)
                : { x: svgRect.x, y: svgRect.y };
            const p2 = this.getBBox
                ? SVGToScreen(svg, this, svgRect.x + svgRect.width, svgRect.y + svgRect.height)
                : { x: svgRect.x + svgRect.width, y: svgRect.y + svgRect.height };
            const width = Math.abs(p1.x - p2.x); const height = Math.abs(p1.y - p2.y);
            const left = clientRect.left + clientRect.width / 2 - width / 2;
            const top = clientRect.top + clientRect.height / 2 - height / 2;

            return {
                [Width]: width,
                [Height]: height,
                [Left]: left,
                [Right]: left + width,
                [Top]: top,
                [Bottom]: top + height,
                [CenterX]: left + width / 2,
                [CenterY]: top + height / 2
            };
        };

    element.globalPosition = new Transform(
        element._getBBox()[CenterX] - svg._getBBox()[Left],
        element._getBBox()[CenterY] - svg._getBBox()[Top]
    );
    element.localTransform = parseTransform(element);
}

function inferTypeFromPath(element, state, transform) {
    const commands = parser.parseSVG(element.getAttribute('d'));
    if (!commands.length) return;

    element.contour = commands;
    const endCmd = commands[commands.length - 1];
    const relCommands = ['v', 'h'];
    const lineCandidates = containsLines(commands);

    if (commands.length === 3 && commands[1].code === 'A' && endCmd.code === 'A') { // Check for ellipse shape
        element.type = Ellipse;
    } else if (lineCandidates.length) { // Check for extracted gridlines
        const p = select(element.parentElement);

        // Create new elements for each gridline
        lineCandidates.forEach(lc => {
            const style = window.getComputedStyle(element);
            const el = p.append('path').attr('d', lc)
                .style('fill', style.fill)
                .style('color', style.color)
                .style('stroke', style.stroke)
                .style('stroke-width', style.strokeWidth)
                .attr('id', 'test');
            analyzeDomTree(el.node(), state, transform);
        });

        select(element).remove();
    } else if (endCmd.code !== 'Z') { // Check for line shape
        element.type = Line;
    } else if (commands.length === 5 && relCommands.includes(commands[1].code) && relCommands.includes(commands[2].code) &&
        relCommands.includes(commands[3].code)) { // Check for rectangular shape
        element.type = Rect;
    } else { // Check for polygonal shape
        element.type = Polygon;
    }
}

function analyzeDomTree(element, state, transform, parent = false) {
    if (!element) return;
    if (element.nodeName.toLowerCase() === Style) return; // Ignore style elements
    if (element.className && (element.className.baseVal === Background || // Ignore background elements
        element.className.baseVal === Foreground)) return;
    // TODO: Ignore clip elements

    if (parent || element.nodeName === SvgContainer) { // Store base SVG element
        state.svg = element;
        extractElementInformation(state.svg, element, transform, parent);
        if (!element.id) element.id = DefaultSvgId + '-' + id++;
    } else if (element.nodeName === SvgGroup) { // Maintain <g> element transforms
        parseTransform(element, transform);
    } else if (element.nodeName === TextRef && element.textContent.trim() !== '') { // Instantiate text elements for non-empty references
        let el = element.parentElement;
        if (el.nodeName !== Text) {
            el = select(el).append('text').html(element.textContent).node();
            select(element).remove();
        }

        extractElementInformation(state.svg, el, transform);
        el.removeAttribute('textLength');
        state.textMarks.push(el);
        el.style['pointer-events'] = 'none';
        el.style['user-select'] = 'none';
    } else if (markTypes.includes(element.nodeName)) { // Process base SVG marks
        const markType = element.nodeName;

        if (markType === Path) { // Infer path element type
            inferTypeFromPath(element, state, transform);
            element.setAttribute('vector-effect', 'non-scaling-stroke');
        } else if (markType === Polyline || markType === Polygon || markType === Line) {
            element.type = markType;
            element.setAttribute('vector-effect', 'non-scaling-stroke');
        }

        extractElementInformation(state.svg, element, transform);
        element.setAttribute(MarkRole, 'true');
        if (!state.svgMarks.includes(element)) state.svgMarks.push(element); // Prevent duplicate references
    }

    for (const child of element.childNodes) {
        analyzeDomTree(child, state, new Transform(transform));
    }
}

export function inspect(svg) {
    const state = new ViewState();
    analyzeDomTree(svg, state, new Transform(), true);
    state.svg = svg;
    console.log(state);
    return state;
}
