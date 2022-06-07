import { Text } from '../state/constants';
import { Transform } from './transform';
import { Path, Ellipse } from '../state/constants';
import { scaleLinear } from 'd3-scale';

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
    for (const mark of state.svgMarks) {
        if (mark.nodeName !== Path || (!state.xAxis.ticks.length && !state.yAxis.ticks.length) || 
           (mark.nodeName === Path && mark.type === Ellipse)) {
            if (false && mark.__data__) {
                if (typeof mark.__data__ === 'string' || typeof mark.__data__ === 'number') {
                    var iterable = mark.__data__;
                    break;
                }

                let hasDatum = 'datum' in mark.__data__;
                let hasProperties = 'properties' in mark.__data__;
                let hasData = 'data' in mark.__data__;
            
                var iterable = hasDatum ? mark.__data__.datum 
                : hasProperties ? mark.__data__.properties 
                : hasData ? mark.__data__.data : mark.__data__;
            } else {
                const svgRect = state.svg.getBoundingClientRect();
                let markX = (mark.clientRect.left + mark.clientRect.right) / 2
                    // - state.xAxis.ticks[0]['ticks'][0].parentNode._global_transform[0]
                    - svgRect.left;
                let markY = (mark.clientRect.top + mark.clientRect.bottom) / 2
                    // - state.yAxis.ticks[0]['ticks'][0].parentNode._global_transform[1]
                    - svgRect.top;

                if (state.legends[0]) {
                    var legend1 = state.legends[0].marks[0];
                    var legend2 = state.legends[0].marks[state.legends[0].marks.length - 1];
                    var label1 = legend1.label.__data__ ? legend1.label.__data__ : +legend1.label.innerHTML;
                    var label2 = legend2.label.__data__ ? legend2.label.__data__ : +legend2.label.innerHTML;
                    var legendScale = scaleLinear().domain(state.xAxis.title ? [label1, label2] : [label2, label1])
                        .range(state.xAxis.title ? [legend1.mark.getBoundingClientRect().height, legend2.mark.getBoundingClientRect().height]
                        : [legend2.mark.getBoundingClientRect().height, legend1.mark.getBoundingClientRect().height]);
                    if (!state.legends[0].scale) state.legends[0].scale = legendScale;
                }

                if (state.xAxis.title && state.yAxis.title) {
                    var iterable = {
                        [state.xAxis.title.innerHTML]: state.xAxis.scale.invert(markX).toFixed(2),
                        [state.yAxis.title.innerHTML]: state.yAxis.scale.invert(markY).toFixed(2)
                    }
                } else {
                    var iterable = {};
                }
                
                if (state.legends[0]) {
                    if (!state.legends[0].title) {
                        var title = 'legend';
                    } else {
                        var title = state.legends[0].title.innerHTML;
                    }
                    iterable[title] = legendScale.invert(mark.getBoundingClientRect().height).toFixed(2)
                }
            }

            mark.style['pointer-events'] = 'fill';
            mark.__inferred__data__ = iterable;
        }
    }
}

export function getFormatVal(element) {
    if (!element) return null;
    return element.__data__ || +element.__data__ === 0 
        ? element.__data__.datum ? element.__data__.datum.value
        : element.__data__
        : isNaN(parseInt(element.innerHTML)) ? element.innerHTML
        : +(element.innerHTML.replace(/,/g, ''));
}
