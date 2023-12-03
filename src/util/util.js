import { Right, Left, Top, CenterX, CenterY } from '../state/constants.js';
import { sum } from 'd3-array';

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
    const clientRect = element._getBBox();
    const offset = orient === Right || orient === Left ? clientRect.width / 2 : clientRect.height / 2;
    return clientRect[orient] + (orient === Left || orient === Top ? offset : -offset);
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
        ? (a._getBBox()[dim] - b._getBBox()[dim])
        : useField
            ? a[field] - b[field]
            : ((a[field] ? a[field] : a.marks[0])._getBBox()[dim] - (b[field] ? b[field] : b.marks[0])._getBBox()[dim]);
    objects.sort(comparator(CenterX));
    objects.sort(comparator(CenterY));
}
