import { loadCSV, loadJSON, table } from 'arquero';
import { map, range } from 'd3-array';
import { timeFormat, timeParse } from 'd3-time-format';
import {
    CategoricalColorLegend, DataAttr, OpacityField, SelectOpacity,
    tableIndexField, tableMarkField
} from '../../state/constants.js';
import { DataState } from '../../state/data-state.js';
import { Transform } from '../../util/transform.js';
import { invertBand } from './legend-parser.js';

export async function parseDataset(options) {
    if (!options || !Object.keys(options).length) return { };
    const { url } = options;
    const type = url.split('.').pop();
    const _table = await (type === 'json'
        ? loadJSON(url)
        : type === 'tsv'
            ? loadCSV(url, { delimiter: '\t' })
            : loadCSV(url)
    );

    return new DataState(_table.assign(table({ [tableIndexField]: range(_table.numRows()) })));
}

export function parseDataFromMarks(marks) {
    const dataset = { };
    let dataList = marks.map(d => d[DataAttr]);
    dataList = dataList.flat();
    const keys = Object.keys(dataList[0]);

    marks.forEach((d, i) => { d[tableIndexField] = i; });
    keys.forEach(k => { dataset[k.toLowerCase()] = map(dataList, d => d[k.toLowerCase()]); });
    dataset[tableMarkField] = marks;
    dataset[tableIndexField] = range(marks.length);

    return new DataState(table(dataset));
}

export function parseTransform(element, transforms = new Transform()) {
    if (!element.transform) return;
    const transformList = element.transform.baseVal;

    for (let i = 0; i < transformList.numberOfItems; ++i) {
        const transform = transformList.getItem(i);
        const matrix = transform.matrix;

        transforms.translate.x += matrix.e;
        transforms.translate.y += matrix.f;
        transforms.scale.x *= matrix.a;
        transforms.scale.y *= matrix.d;
        transforms.rotate += transform.angle;
    }

    return transforms;
}

export function inferMarkAttributes(state) {
    // function getData() {

    // }

    state.svgMarks = state.svgMarks.filter(d => d.type !== 'line');
    // console.log(state.xAxis.scale.domain(), state.yAxis.scale.domain())
    for (let i = 0; i < state.svgMarks.length; ++i) {
        const mark = state.svgMarks[i]; const svgRect = state.svg.getBBoxCustom();
        const markRect = mark.getBBoxCustom();

        if (mark.type === 'line') continue;
        if (mark.type === 'polyline') {
            const points = mark.getAttribute('points').split(' ').map(d => d.split(',').map(e => Number(e)));
            mark[DataAttr] = [];

            for (const point of points) {
                let [x, y] = point;
                // x = x - svgRect.left;
                // y = y - svgRect.top;

                const iterable = { };
                iterable[state.xAxis.title ? state.xAxis.title.innerHTML.toLowerCase() : 'x'] = state.xAxis.scale.invert(x);
                iterable[state.yAxis.title ? state.yAxis.title.innerHTML.toLowerCase() : 'y'] = state.yAxis.scale.invert(y);

                for (let j = 0; j < state.legends.length; ++j) {
                    const legend = state.legends[j];
                    const val = legend.type === CategoricalColorLegend
                        ? legend.scale.domain()[legend.scale.range().indexOf(window.getComputedStyle(mark)[legend.matchingAttr])]
                        : legend.scale.invert(markRect.width ** 2);

                    iterable[legend.title ? legend.title.innerHTML.toLowerCase() : 'legend-' + j] = val;
                }

                mark[DataAttr].push(iterable);
            }

            continue;
        };

        const markX = state.xAxis.ordinal.length
            ? i
            : state.yAxis.ordinal.length || mark.type === 'rect'
                ? markRect.right
                : markRect.centerX;
        const markY = state.yAxis.ordinal.length
            ? i
            : state.xAxis.ordinal.length
                ? markRect.top
                : markRect.centerY;

        // console.log(state.xAxis.scale.domain()[markX])
        const iterable = { };
        // console.log(markX, markY)
        // console.log(state.xAxis.scale.invert(markX), state.yAxis.scale.invert(markY))
        iterable[state.xAxis.title ? state.xAxis.title.innerHTML.toLowerCase() : 'x'] = state.xAxis.ordinal.length ? invertBand(state.xAxis.scale, markRect.centerX) : state.xAxis.scale.invert(markX);
        iterable[state.yAxis.title ? state.yAxis.title.innerHTML.toLowerCase() : 'y'] = state.yAxis.ordinal.length
            ? invertBand(state.yAxis.scale, markRect.centerY)
            : mark.type === 'rect'
                ? String(Math.round(state.yAxis.scale.invert(markY)))
                : state.yAxis.scale.invert(markY);
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
    // function levelLookup(value) {
    //     value = value.toLowerCase();

    //     if (value.includes('%y')) {
    //         return '%Y %m %d %H:%M:%S';
    //     }

    //     if (value.includes('%m') || value.includes('%b')) {
    //         return '%m %d %H:%M:%S';
    //     }

    //     if (value.includes('%a') || value.includes('%d')) {
    //         return '%d %H:%M:%S';
    //     }

    //     if (value.includes('%h')) {
    //         return '%H:%M:%S';
    //     }
    // }

    // function toFormattedDate(date, specifier) {
    //     return timeParse(specifier)(timeFormat(specifier)(date));
    // }

    function checkSubsets(subsets) {
        function checkSubset(formats, priorFormat) {
            if (!formats || !formats.length) return null;

            for (const format of formats[0]) {
                const f = priorFormat.length ? priorFormat + ' ' + format : format;
                const parsedVal = timeParse(f)(d);

                if (f !== '%m' && f !== '%d' && parsedVal) { // Skip conflicts with ints
                    // console.log(f, d, parsedVal);
                    return { format: timeFormat(f), value: parsedVal };
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
        [yearFormats, monthFormats, dayFormats],
        [monthFormats, dayFormats, yearFormats],
        [monthFormats, yearFormats],
        [dayFormats, monthFormats, yearFormats],
        [weekFormats, monthFormats, dayFormats, yearFormats],
        [weekFormats, dayFormats, monthFormats, yearFormats]
    ];

    const fullFormats = ['%Y-%m-%d', '%Y %m %d %H:%M:%S', '%Y-%m-%d% %H:%M:%S', '%Y %m %d %H:%M', '%Y-%m-%d% %H:%M',
        '%H:%M:%S', '%H:%M'];

    for (const format of fullFormats) {
        const parsedVal = timeParse(format)(d);
        if (parsedVal) return { format: timeFormat(format), value: parsedVal };
    }

    return checkSubsets(subsets);
}

// function getIntType() {
//     const transformations = {
//         Y: 1e24,
//         Z: 1e21,
//         E: 1e18,
//         P: 1e15,
//         T: 1e12,
//         G: 1e9,
//         M: 1e6,
//         k: 1e3,
//         h: 1e2,
//         da: 1e1,
//         d: 1e-1,
//         c: 1e-2,
//         m: 1e-3,
//         μ: 1e-6,
//         n: 1e-9,
//         p: 1e-12,
//         f: 1e-15,
//         a: 1e-18,
//         z: 1e-21,
//         y: 1e-24,
//         '%': 1e-2
//     };

//     const regexVals = {
//         $: /£|\$/g,
//         '+': /\+/g,
//         ',': /,/g,
//         '.': /./g
//     };
//     const formats = ['.0%', '.2%'];
//     const currencies = /£|\$/g;
// }

export function getFormatVal(element, isDate) {
    if (!element) return null;

    const elData = element.innerHTML.replace(/–/g, '-').replace(/−/g, '-') // Replace with hyphen for parsing
        .replace(/,/g, ''); // Replace commas
    // if (format) return format(element.innerHTML);

    const int = parseFloat(elData);
    const date = getDate(elData);

    return isNaN(int) || (elData.includes('-') && elData.charAt(0) !== '-') || elData.includes('/')
        ? (date && isDate
            ? date
            : elData)
        : int;
}
