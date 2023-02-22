import { CategoricalColorLegend, Line, OpacityField, Rect, SelectOpacity } from '../state/constants';
import { Transform } from '../util/transform';

export function parseTransform(element, isGlobal, transforms = new Transform()) {
    const transformList = element.transform.baseVal;

    for (let i = 0; i < transformList.numberOfItems; ++i) {
        const transform = transformList.getItem(i);
        const matrix = transform.matrix;

        switch (transform.type) {
            case transform.SVG_TRANSFORM_TRANSLATE:
                transforms.translate.x += matrix.e;
                transforms.translate.y += matrix.f;
                break;
            case transform.SVG_TRANSFORM_SCALE:
                transforms.scale.x += matrix.a;
                transforms.scale.y += matrix.d;
                break;
            case transform.SVG_TRANSFORM_ROTATE:
                transforms.rotate += transform.angle;
                break;
            default:
                break;
        }
    }

    transforms.translate.x += element.hasAttribute('cx') && isGlobal ? +element.getAttribute('cx') : 0;
    transforms.translate.y += element.hasAttribute('cy') && isGlobal ? +element.getAttribute('cy') : 0;

    return transforms;
}

export function inferMarkAttributes(state) { 
    for (let i = 0; i < state.svgMarks.length; ++i) {
        const mark = state.svgMarks[i];
        if (mark.type === Line) continue; 
            
        const svgRect = state.svg._getBBox();
        const markRect = mark._getBBox();
        const markX = state.xAxis.ordinal.length 
            ? i 
            : state.yAxis.ordinal.length || mark.type === Rect
            ? markRect.right - svgRect.left 
            : markRect.centerX - svgRect.left;
        const markY = state.yAxis.ordinal.length 
            ? i 
            : state.xAxis.ordinal.length
            ? markRect.top - svgRect.top
            : markRect.centerY - svgRect.top; 
            
        const iterable = { };
        // console.log(markX, markY)
        // console.log(state.xAxis.scale.invert(markX), state.yAxis.scale.invert(markY))
        iterable[state.xAxis.title ? state.xAxis.title.innerHTML.toLowerCase() : 'x'] = state.xAxis.ordinal.length ? state.xAxis.scale.domain()[markX] : state.xAxis.scale.invert(markX);
        iterable[state.yAxis.title ? state.yAxis.title.innerHTML.toLowerCase() : 'y'] = state.yAxis.ordinal.length ? state.yAxis.scale.domain()[markY] : state.yAxis.scale.invert(markY);
        // if (!state.yAxis.ordinal.length && state.yAxis.scale.invert(markY) <= 1 && state.yAxis.scale.invert(markY) >= 0) {
        //     console.log(mark, mark.getBBox(), mark.getBoundingClientRect(), markY)
        // }
        for (let j = 0; j < state.legends.length; ++j) {
            const legend = state.legends[j];
            const val = legend.type === CategoricalColorLegend 
                ? legend.scale.domain()[legend.scale.range().indexOf(window.getComputedStyle(mark)[legend.matchingAttr])]
                : legend.scale.invert(markRect.width ** 2);

            iterable[legend.title ? legend.title.innerHTML.toLowerCase() : 'legend-' + j] = val;
        }

        mark.style['pointer-events'] = 'fill';
        mark.__inferred__data__ = iterable;
        mark[OpacityField] = mark.hasAttribute('opacity') 
            ? +mark.getAttribute('opacity')
            : window.getComputedStyle(mark).opacity || SelectOpacity; 
    }
}

export function isDate(d) {
    const _d = new Date(d);
    if (Object.prototype.toString.call(_d) === '[object Date]') {
        return !isNaN(_d);
    }
    return false;
}

export function getFormatVal(element) {
    if (!element) return null;
    const elData = element.innerHTML.replace(/–/g, '-').replace(/−/g, '-'); // Replace with hyphen for int parsing
    const date = elData.replace(/,/g, '');
    const int = parseInt(date);

    return isNaN(int)
        ? (isDate(date)
            ? new Date(date)
            : elData)
        : int;
}
