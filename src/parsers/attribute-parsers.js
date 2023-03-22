import { format } from 'd3-format';
import { timeFormat, timeParse } from 'd3-time-format';
import { CategoricalColorLegend, DataAttr, Line, OpacityField, Rect, SelectOpacity } from '../state/constants';
import { Transform } from '../util/transform';
import { invertBand } from './legend-parsers';

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
    state.svgMarks = state.svgMarks.filter(d => d.type !== Line);
    // console.log(state.xAxis.scale.domain(), state.yAxis.scale.domain())
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
            
        // console.log(state.xAxis.scale.domain()[markX])
        const iterable = { };
        // console.log(markX, markY)
        // console.log(state.xAxis.scale.invert(markX), state.yAxis.scale.invert(markY))
        iterable[state.xAxis.title ? state.xAxis.title.innerHTML.toLowerCase() : 'x'] = state.xAxis.ordinal.length ? invertBand(state.xAxis.scale, markRect.centerX - svgRect.left) : state.xAxis.scale.invert(markX);
        iterable[state.yAxis.title ? state.yAxis.title.innerHTML.toLowerCase() : 'y'] = state.yAxis.ordinal.length ? invertBand(state.yAxis.scale, markRect.centerY - svgRect.top) : state.yAxis.scale.invert(markY);
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
        mark[DataAttr] = iterable;
        mark[OpacityField] = mark.hasAttribute('opacity') 
            ? +mark.getAttribute('opacity')
            : window.getComputedStyle(mark).opacity || SelectOpacity; 
    }
}

function getDate(d) {
    function levelLookup(value) {
        value = value.toLowerCase();

        if (value.includes('%y')) {
            return '%Y %m %d %H:%M:%S';
        }

        if (value.includes('%m') || value.includes('%b')) {
            return '%m %d %H:%M:%S';
        }

        if (value.includes('%a') || value.includes('%d')) {
            return '%d %H:%M:%S';
        }

        if (value.includes('%h')) {
                return '%H:%M:%S';
        }
    }

    function toFormattedDate(date, specifier) {
        return timeParse(specifier)(timeFormat(specifier)(date));
    } 

    function checkSubsets(subsets) {
        function checkSubset(formats, priorFormat) {
            if (!formats || !formats.length) return null;

            for (const format of formats[0]) {
                const f = priorFormat.length ? priorFormat + ' ' + format : format;
                const parsedVal = timeParse(f)(d);

                if (f !== '%m' && f !== '%d' && parsedVal) { // Skip conflicts with ints
                    return { format: date => toFormattedDate(date, levelLookup(f)), value: parsedVal };
                }

                const others = checkSubset(formats.slice(1), f);
                if (others) return others;
            }

            return null;
        }

        for (const subset of subsets) {
            const format = checkSubset(subset, '');
            if (format) return format;
        }
    }
    
    const dayFormats = ['%d'];
    const weekFormats = ['%a', '%A'];
    const monthFormats = ['%b', '%B', '%m'];
    const yearFormats = ['%Y', '\'%y'];
    const subsets = [
        [monthFormats, yearFormats],
        [yearFormats, monthFormats, dayFormats], 
        [monthFormats, dayFormats, yearFormats],
        [dayFormats, monthFormats, yearFormats],
        [weekFormats, monthFormats, dayFormats, yearFormats],
        [weekFormats, dayFormats, monthFormats, yearFormats],
    ];

    const fullFormats = ['%Y %m %d %H:%M:%S', '%Y-%m-%d% %H:%M:%S', '%Y %m %d %H:%M','%Y-%m-%d% %H:%M', 
        '%H:%M:%S', '%H:%M'];

    for (const formats of fullFormats) {
        for (const format of formats) {
            const parsedVal = timeParse(format)(d);
            if (parsedVal) return { format: date => toFormattedDate(date, levelLookup(format)), value: parsedVal };
        }
    }

    return checkSubsets(subsets);
}

function getIntType() {
    const transformations = {
        Y: 1e24,
        Z: 1e21,
        E: 1e18,
        P: 1e15,
        T: 1e12,
        G: 1e9,
        M: 1e6,
        k: 1e3,
        h: 1e2,
        da: 1e1,
        d: 1e-1,
        c: 1e-2,
        m: 1e-3,
        μ: 1e-6,
        n: 1e-9,
        p: 1e-12,
        f: 1e-15,
        a: 1e-18,
        z: 1e-21,
        y: 1e-24,
        '%': 1e-2,
    };

    const regexVals = {
        '$': /£|\$/g,
        '+': /\+/g,
        ',': /,/g,
        '.': /./g
    };
    const formats = ['.0%', '.2%'];
    const currencies = /£|\$/g;
}

export function getFormatVal(element, isDate) {
    if (!element) return null;

    const elData = element.innerHTML.replace(/–/g, '-').replace(/−/g, '-') // Replace with hyphen for parsing
        .replace(/,/g, ''); // Replace commas
    // if (format) return format(element.innerHTML);

    const int = parseFloat(elData);
    const date = getDate(elData);

    return isNaN(int) 
        ? (date && isDate
            ? date 
            : elData)
        : int;
}
