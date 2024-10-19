import { CenterX, CenterY } from '../state/constants.js';
import { sum } from 'd3-array';
import { path } from 'd3-path';

export function isMetaKey(event) {
    return event.metaKey || event.ctrlKey || event.altKey || event.shiftKey;
}

export function copyElement(element) {
    const newElement = element.cloneNode(true);
    for (const [key, value] of Object.entries(element)) {
        newElement[key] = value;
    }

    return newElement;
}

export function computeCenterPos(element, orient) {
    const clientRect = element.getBBoxCustom();
    const offset = orient === 'right' || orient === 'left' ? clientRect.width / 2 : clientRect.height / 2;
    return clientRect[orient] + (orient === 'left' || orient === 'top' ? offset : -offset);
}

export function flattenRGB(rgb) {
    return sum(rgb.replace(/[^\d,]/g, '').split(','));
}

export function convertPtToPx(pt) {
    if (!pt || !pt.includes('pt')) return pt;
    return +pt.split('pt')[0] * 4 / 3;
}

export function SVGToScreen(svg, element, svgX, svgY) {
    const p = svg.createSVGPoint();
    p.x = svgX;
    p.y = svgY;
    return p.matrixTransform(element.getScreenCTM());
}

export function sortByViewPos(field, objects, useField = false) {
    const comparator = (dim) => (a, b) => field == null
        ? (a.getBBoxCustom()[dim] - b.getBBoxCustom()[dim])
        : useField
            ? a[field] - b[field]
            : ((a[field] ? a[field] : a.marks[0]).getBBoxCustom()[dim] -
               (b[field] ? b[field] : b.marks[0]).getBBoxCustom()[dim]);
    objects.sort(comparator(CenterX));
    objects.sort(comparator(CenterY));
}

// Parse single-element lines into separate SVG elements.
export function containsLines(commands) {
    if (commands.length <= 2 || commands.length % 2 !== 0) return [];

    const lines = [];
    for (let i = 0; i < commands.length; i += 2) {
        if (commands[i].code !== 'M' || commands[i + 1].code !== 'L') {
            return [];
        }

        const p = path();
        p.moveTo(commands[i].x, commands[i].y);
        p.lineTo(commands[i + 1].x, commands[i + 1].y);
        lines.push(p.toString());
    }

    return lines;
}
