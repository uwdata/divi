import { min, max } from 'd3-array';
import { scaleTime, scaleBand, scaleLinear } from 'd3-scale';
import { Bottom, Left, Right, Top } from '../state/constants';
import { axisBottom, axisLeft } from '../_d3/axis';
import { getFormatVal } from './attribute-parsers';
import { compareTickStyles, computeBounds, computeCenterPos } from './util';

const epsilon = 0.5;

// export function groupLabels(state) {
//     function offset(tick, text) {
//         if (!text) return Number.MAX_VALUE;

//         const axis = tick['ticks'][0].className.baseVal;
//         const xOffset = Math.abs((text.clientRect.left + text.clientRect.right) / 2 - tick['offset']);
//         const yOffset = Math.abs((text.clientRect.top + text.clientRect.bottom) / 2 - tick['offset']);

//         return axis.includes('x-axis') ? xOffset : yOffset;
//     }

//     const axes = [state.xAxis, state.yAxis];
//     for (const axis of axes) {
//         const ticks = axis.ticks;

//         for (const tick of ticks) {
//             for (const axisTextMark of state.axisTextMarks) {
//                 const currOffset = offset(tick, tick['label']);
//                 const newOffset = offset(tick, axisTextMark);

//                 if (newOffset < currOffset) {
//                     const axis = tick['ticks'][0].className.baseVal;
//                     const tie = Math.abs(newOffset - currOffset) < epsilon && tick['label']
//                     ? axis.includes('x-axis') ? tick['label'].clientRect.top - axisTextMark.clientRect.top
//                     : axisTextMark.clientRect.left - tick['label'].clientRect.left
//                     : 1; 

//                     if (tie > 0) tick['label'] = axisTextMark;
//                 }
//             }

//             tick['label'].tick = true;
//         }
//     }

//     state.axisTextMarks.filter(textMark => !textMark.tick).map(textMark => state.textMarks.push(textMark));
//     state.axisTextMarks = state.axisTextMarks.filter(textMark => textMark.tick);
// }

// export function groupAxis(axis, index) {
//     let positionMap = { };

//     for (let i = 0; i < axis.ticks.length; ++i) {
//         let offset = axis.ticks[i].clientRect[index];
//         axis.ticks[i].setAttribute('class', (index === 'left' ? 'x-axis' : 'y-axis') + ' tick');

//         offset in positionMap ? positionMap[offset]['ticks'].push(axis.ticks[i]) 
//         : positionMap[offset] = { 'label': null, 'ticks': [axis.ticks[i]] };
//     }

//     axis.ticks = [];
//     for (const [key, value] of Object.entries(positionMap)) {
//         value['offset'] = +key;
//         axis.ticks.push(value);
//     }

//     axis.ticks.sort((first, second) => +first['offset'] < +second['offset'] ? -1 : (+first['offset'] > +second['offset'] ? 1 : 0))
// }

export function groupLegend(state) {
    let titleX, titleY,
        minX = 10000, maxY = 0;
    for (const text of state.textMarks) {
        if (text.clientRect.left < minX) {
            minX = text.clientRect.left;
            titleY = text;
        }
        if (text.clientRect.bottom > maxY) {
            maxY = text.clientRect.bottom;
            titleX = text;
        }
    }

    if (titleY && Math.abs(minX - state.svg.clientRect.left) < 50) {
        titleY.__title__ = true;
        state.titles.y = titleY;
    }
    if (titleX && Math.abs(maxY - state.svg.clientRect.bottom) < 50) {
        titleX.__title__ = true;
        state.titles.x = titleX;    
    } 

    for (const text of state.textMarks) {
        if (text.__title__) continue;

        let textX = (text.clientRect.left + text.clientRect.right) / 2,
            textY = (text.clientRect.top + text.clientRect.bottom) / 2;
        let minPos = 10000, minMark;

        for (const mark of state.svgMarks) {
            let markX = (mark.clientRect.left + mark.clientRect.right) / 2,
                markY = (mark.clientRect.bottom + mark.clientRect.bottom) / 2;
            // let diff = Math.abs(mark_x - text_x) + Math.abs(mark_y - text_y);
            let diff = Math.abs(markX - textX) + Math.abs(markY - textY);

            if (diff < minPos) {
                minPos = diff;
                minMark = mark;
            }
        }

        minMark.removeAttribute('__mark__');
        text.setAttribute('__legend__', true);
        minMark.setAttribute('__legend__', 'true');
        // min_mark.style['pointer-events'] = 'fill';
        // console.log(min_mark)
        state.legend.push({'label': text, 'glyph': minMark});
    }
}

export function identifyAxes(state) {
    function collectOrphanTicks(axes) {
        for (const axis of axes) {
            for (const tick of axis.ticks) {
                let newTicks = [];
  
                for (const tickMark of tick.marks) {
                    for (const mark of state.svgMarks) {
                        if (!mark.__tick__ && compareTickStyles(mark, tickMark)) {
                                mark.removeAttribute('__mark__');
                                mark.__tick__ = true;
                                newTicks.push({'label': null, marks: [mark]});
                            }
                    }
                }

                axis.ticks = axis.ticks.concat(newTicks);
            }
        }
    }

    function pruneTicks(axis, position) {
        for (const tick of axis.ticks) {
            for (const mark of tick.marks) {
                const [lh, rh] = computeBounds(mark, position);
                if (lh > tick.range[0] && rh < tick.range[1]) {
                    mark.setAttribute('__mark__', true);
                    mark.__tick__ = false;
                }
            }

            tick.marks = tick.marks.filter(d => d.__tick__);
        }
    }

    function collectGroups(groups) {
        let candidateAxes = [];
        for (const [position, group] of Object.entries(groups)) {
            for (const [_, value] of Object.entries(group)) {
                if (value.length > 1) candidateAxes.push([position, value]);
            }
        }
        return candidateAxes;
    }

    function pruneGroups(groups) {
        // Identify aligned marks as ticks
        for (const [position, group] of groups) {
            for (const textMark of group) {
                textMark.removeAttribute('textLength');
                const tick = {label: textMark, marks: [], range: [Number.MAX_VALUE, Number.MIN_VALUE]};
                const textOffset = computeCenterPos(textMark, position === Right ? Top : Right);

                for (const mark of state.svgMarks) {
                    const markOffset = computeCenterPos(mark, position === Right ? Top : Right);
                    if (Math.abs(textOffset - markOffset) < epsilon) {
                        mark.removeAttribute('__mark__');
                        mark.__tick__ = true;

                        const minPos = mark.clientRect[position === Right ? Left : position];
                        const maxPos = mark.clientRect[position === Top ? Bottom : position];
                        if ((position === Right && maxPos > tick.range[1]) || (position === Top && minPos < tick.range[0])) {
                            tick.range[0] = minPos;
                            tick.range[1] = maxPos;
                        }

                        tick.marks.push(mark);
                    }
                }

                const axis = position === Right ? state.yAxis : state.xAxis;
                axis.ticks.push(tick);
            }
        }

        pruneTicks(state.xAxis, Top);
        pruneTicks(state.yAxis, Right);
        collectOrphanTicks([state.xAxis, state.yAxis]);

        // Remove ticks from mark
        state.svgMarks = state.svgMarks.filter(d => !d.__tick__);
    }

    const positionMaps = {[Right]: {}, [Top]: {}}
    
    for (const textMark of state.textMarks) {
        for (const [position, _map] of Object.entries(positionMaps)) {
            const offset = textMark.clientRect[position];
            offset in _map ? _map[offset].push(textMark) : _map[offset] = [textMark];
        }
    }

    const candidateAxes = collectGroups(positionMaps);
    pruneGroups(candidateAxes);
}

export function computeDomain(axis) {
    for (const [_, value] of Object.entries(axis.ticks)) {
        if (!value.label) continue;
        let formatVal = getFormatVal(value.label);

        if (typeof formatVal === 'string') {
            axis.ordinal.push(formatVal);
        } else {
            axis.domain[0] = axis.domain[0] === null ? formatVal : min([axis.domain[0], formatVal]);
            axis.domain[1] = axis.domain[1] === null ? formatVal : max([axis.domain[1], formatVal]);
        }
    }
}

export function configureAxes(state) {
    if (state.xAxis.scale && !state.xAxis.ordinal.length) {
        // Infer original X-axis domain
        // const tickLeft = state.xAxis.ticks[0]['ticks'][0].globalPosition['translate'].x;
        // const tickRight = state.xAxis.ticks[state.xAxis.ticks.length - 1]['ticks'][0].globalPosition['translate'].x;
        // const tickLeft = state.xAxis.ticks[0].marks[0].clientRect.left;
        // const tickRight = state.xAxis.ticks[state.xAxis.ticks.length - 1].marks[0].clientRect.left;
        const tickLeft = computeCenterPos(
            state.xAxis.ticks.filter(d => getFormatVal(d.label) === state.xAxis.domain[0])[0].label, Left
        );
        const tickRight = computeCenterPos(
            state.xAxis.ticks.filter(d => getFormatVal(d.label) === state.xAxis.domain[1])[0].label, Left
        );
        
        const ticks = [tickLeft, tickRight].map(d => d - state.svg.clientRect.left);
        const newDomainX = state.xAxis.range.map(
            state.xAxis.scale.copy().range(ticks).invert, state.xAxis.scale
        );

        state.xAxis.scale.domain(newDomainX);
    }

    if (state.yAxis.scale && !state.yAxis.ordinal.length) {
        // Infer original Y-axis domain
        // const tickBottom = state.yAxis.ticks[0]['ticks'][0].globalPosition['translate'].y;
        // const tickTop = state.yAxis.ticks[state.yAxis.ticks.length - 1]['ticks'][0].globalPosition['translate'].y;
        // const tickTop = state.yAxis.ticks[0].marks[0].clientRect.top;
        // const tickBottom = state.yAxis.ticks[state.yAxis.ticks.length - 1].marks[0].clientRect.top;
        const tickTop = computeCenterPos(
            state.yAxis.ticks.filter(d => getFormatVal(d.label) === state.yAxis.domain[0])[0].label, Top
        );
        const tickBottom = computeCenterPos(
            state.yAxis.ticks.filter(d => getFormatVal(d.label) === state.yAxis.domain[1])[0].label, Top
        );

        const ticks = [tickTop, tickBottom].map(d => d - state.svg.clientRect.top);
        const newDomainY = state.yAxis.range.map(
            state.yAxis.scale.copy().range(ticks).invert, state.yAxis.scale
        );
        
        state.yAxis.scale.domain(newDomainY);
    }
}

export function constructAxes(state) {
    function pruneMarks() {
        for (const mark of state.svgMarks) {
            if (mark.clientRect.width >= state.xAxis.range[1] - state.xAxis.range[0] &&
                mark.clientRect.height >= state.yAxis.range[0] - state.yAxis.range[1]) {
                    mark.removeAttribute('__mark__');
                }
        }
        state.svgMarks = state.svgMarks.filter(d => d.hasAttribute('__mark__'));
    }

    identifyAxes(state);
    computeDomain(state.xAxis);
    computeDomain(state.yAxis);

    const width = +state.svg.getAttribute('width');
    const height = +state.svg.getAttribute('height');

    if (!state.xAxis.ticks.length && !state.yAxis.ticks.length) {
        state.xAxis.range = [0, width];
        state.yAxis.range = [height, 0];
        return;
    }

    let yTick = state.yAxis.ticks[0];
    let xTick = state.xAxis.ticks[0];
    console.log(xTick.marks[0])
    console.log(xTick.marks[0].clientRect)

    const xMin = yTick.range[0] - state.svg.clientRect.left;
    const xMax = min([yTick.range[1] - state.svg.clientRect.left, width]);
    const yMin = xTick.range[1] - state.svg.clientRect.top;
    const yMax = min([xTick.range[0] - state.svg.clientRect.top, height]);
    console.log([xMin, xMax]);
    console.log([yMin, yMax]);

    state.xAxis.range = [xMin, xMax];
    state.yAxis.range = [yMax, yMin];
    pruneMarks();

    state.xAxis.scale = (state.xAxis.domain[0] instanceof Date ? scaleTime() : (state.xAxis.ordinal.length ? scaleBand() : scaleLinear()))
        .domain(state.xAxis.ordinal.length ? state.xAxis.ordinal : state.xAxis.domain)
        .range(state.xAxis.range)
    state.xAxis.axis = axisBottom(state.xAxis.scale, state)
        .ticks(state.xAxis.ticks.length);

    state.yAxis.scale = (state.yAxis.domain[0] instanceof Date ? scaleTime() : (state.yAxis.ordinal.length ? scaleBand() : scaleLinear()))
        .domain(state.yAxis.ordinal.length ? state.yAxis.ordinal : state.yAxis.domain)
        .range(state.yAxis.range);
    state.yAxis.axis = axisLeft(state.yAxis.scale, state)
        .ticks(state.yAxis.ticks.length);
        // .tickFormat(d => {
    // let s = state.y_axis.ticks[0]['label'].innerHTML;
    //     return s.includes("M") || s.includes("k") ? d3.format(".2s")(d) : d3.format(",")(d);
    // });

    configureAxes(state);
    
    // TO-DO: Domain path 0.5 difference.
    // if (state.hasDomain) {
    //     let axes = [].slice.call(state.svg.querySelectorAll(".domain")).map((d) => { return d.getBoundingClientRect() });
    //     let y_axis = axes[0].width < axes[1].width ? axes[0] : axes[1];
    //     let x_axis = axes[0].height < axes[1].height ? axes[0] : axes[1];

    //     var x_min = x_axis.left - state.svg.getBoundingClientRect().left;
    //     var x_max = x_axis.right - state.svg.getBoundingClientRect().left;

    //     var y_max = y_axis.bottom - state.svg.getBoundingClientRect().top;
    //     var y_min = y_axis.top - state.svg.getBoundingClientRect().top;
    // } else {

    // if (yTick.clientRect.right < xTick.clientRect.left) {
    //     var x_min = y_tick.right - state.svg.getBoundingClientRect().left;
    //     var x_max = width;
    // } else {
    //     var x_min = y_tick.left - state.svg.getBoundingClientRect().left;
    //     var x_max = d3.min([y_tick.width + x_min, width]);
    // }

    // if (x_tick.top > y_tick.bottom) {
    //     var y_max = x_tick.top - state.svg.getBoundingClientRect().top;
    //     var y_min = 0;
    // } else {
    //     var y_max = x_tick.bottom - state.svg.getBoundingClientRect().top;
    //     var y_min = d3.max([y_max - x_tick.height, 0]);
    // }
    // }

    // state.xAxis.scale = (state.xAxis.domain[0] instanceof Date ? d3.scaleTime() : (state.xAxis.ordinal.length ? d3.scaleBand() : d3.scaleLinear()))
        // .domain(state.xAxis.ordinal.length ? state.xAxis.ordinal : state.xAxis.domain)
        // .range(state.xAxis.range)
    // state.x_axis.scale = (state.x_axis.domain[0] instanceof Date ? d3.scaleTime() : d3.scaleLinear())
    //     .domain(state.x_axis.ordinal.length ? state.x_axis.range : state.x_axis.domain)
    //     .range(state.x_axis.range);
    // state.xAxis.axis = axisBottom(state.x_axis.scale, SVG).ticks(state.x_axis.ticks.length);
    // state.x_axis.axis(state.x_axis.ticks);
    // .tickSize(state.x_axis.ticks[1].children[0].getAttribute("y2"))
    // .ticks(typeof x_axis.ticks[0].__data__ === "string" ? state.x_axis.ordinal.length : state.x_axis.ticks.length);

    // configureAxes();

    // let diff_1_y = +state.y_axis.ticks[1]['label'].innerHTML - +state.y_axis.ticks[0]['label'].innerHTML;
    // let diff_2_y = +state.y_axis.ticks[2]['label'].innerHTML - +state.y_axis.ticks[1]['label'].innerHTML;

    // let diff_1_x = +state.x_axis.ticks[1]['label'].innerHTML - +state.x_axis.ticks[0]['label'].innerHTML;
    // if (state.x_axis.ticks.length < 3) {
    //     var diff_2_x = 0;
    // } else {
    //     var diff_2_x = +state.x_axis.ticks[2]['label'].innerHTML - +state.x_axis.ticks[1]['label'].innerHTML;
    // }

    // let diff_tick_a = state.x_axis.ticks[1]['ticks'][0].getBoundingClientRect().left - 
    //     state.x_axis.ticks[0]['ticks'][0].getBoundingClientRect().left;

    // if (state.x_axis.ticks.length < 3) {
    //     var diff_tick_b = 0;
    // } else {
    //     var diff_tick_b = state.x_axis.ticks[2]['ticks'][0].getBoundingClientRect().left - 
    //         state.x_axis.ticks[1]['ticks'][0].getBoundingClientRect().left;
    // }

    // if (Math.abs(diff_1_x - diff_2_x) > 5e-1 || Math.abs(diff_tick_a - diff_tick_b) > 5e-1) {
    //     // let tick_diff_1 = state.x_axis.ticks['ticks'][1].getBoundingClientRect().left - 
    //     //     state.x_axis.ticks['ticks'][0].getBoundingClientRect().left;
    //     // let tick_diff_2 = state.x_axis.ticks['ticks'][2].getBoundingClientRect().left - 
    //     //     state.x_axis.ticks['ticks'][1].getBoundingClientRect().left;

    //     if (Math.abs(diff_tick_a - diff_tick_b) < 5e-1) {
    //         let format = state.x_axis.ticks['ticks'][0].childNodes[1].innerHTML;
    //         if (format != state.x_axis.ticks[0].__data__ && typeof format === "string") { 
    //             var exponent = format.match(/^(e|\d+)\^(e|\d+)$/);
    //             var superscript = format.match(/^(e|d+)([\u2070-\u209F\u00B2\u00B3\u00B9])$/);
    //             if (exponent) {
    //                 var base = exponent[1];
    //                 base = (base === 'e' ? Math.E : parseInt(base));
    //             } else if (superscript) {
    //                 var base = superscript[1];
    //                 base = (base === 'e' ? Math.E : parseInt(base));
    //             }
    //         }
    //     } 
        
    //     function format(d) {
    //         function digitToSuperscript(superChar) {
    //             let table = "⁰¹²³⁴⁵⁶⁷⁸⁹";
    //             return table[superChar];
    //         }

    //         let exp = Math.log(d) / Math.log(base);
    //         return superscript ? 'e' + String(exp).replace(/\d/g, digitToSuperscript) : d + '^' + exp;
    //     }

    //     state.x_axis.scale = d3.scaleLog()
    //         .domain(state.x_axis.domain)
    //         .range(state.x_axis.range);
    //     state.x_axis.axis = axisBottom(state.x_axis.scale, SVG)
    //         // .tickSize(state.x_axis.ticks[1].children[0].getAttribute("y2"))
    //         .ticks(state.x_axis.ticks.filter(d => d['label'].innerHTML).length)
    //     if (base) {
    //         state.x_axis.scale = state.x_axis.scale.base(base);
    //         state.x_axis.axis = state.x_axis.axis.tickFormat(d => exponent || superscript ? format(d) : d);
    //     }
    // } else {
    //     state.x_axis.scale = (state.x_axis.domain[0] instanceof Date ? d3.scaleTime() : (state.x_axis.ordinal.length ? d3.scaleBand() : d3.scaleLinear()))
    //         .domain(state.x_axis.ordinal.length ? state.x_axis.ordinal : state.x_axis.domain)
    //         .range(state.x_axis.range)
    //     // state.x_axis.scale = (state.x_axis.domain[0] instanceof Date ? d3.scaleTime() : d3.scaleLinear())
    //     //     .domain(state.x_axis.ordinal.length ? state.x_axis.range : state.x_axis.domain)
    //     //     .range(state.x_axis.range);
    //     state.x_axis.axis = axisBottom(state.x_axis.scale, SVG)
    //         .ticks(state.x_axis.ticks.length);
    //     // state.x_axis.axis(state.x_axis.ticks);
    //         // .tickSize(state.x_axis.ticks[1].children[0].getAttribute("y2"))
    //         // .ticks(typeof x_axis.ticks[0].__data__ === "string" ? state.x_axis.ordinal.length : state.x_axis.ticks.length);
    // }

    // if (Math.abs(diff_1_y - diff_2_y) > 5e-1) {
    //     state.y_axis.scale = d3.scaleLog()
    //         .domain(state.y_axis.domain)
    //         .range(state.y_axis.range);
    //     state.y_axis.axis = d3.axisLeft(state.y_axis.scale)
    //         .tickSize(-state.y_axis.ticks[1].children[0].getAttribute("x2"))
    //         .ticks(state.y_axis.ticks.length);
    // } else {
    //     state.y_axis.scale = (state.y_axis.domain[0] instanceof Date ? d3.scaleTime() : (state.y_axis.ordinal.length ? d3.scaleBand() : d3.scaleLinear()))
    //         .domain(state.y_axis.ordinal.length ? state.y_axis.ordinal : state.y_axis.domain)
    //         .range(state.y_axis.range);
    //     state.y_axis.axis = axisLeft(state.y_axis.scale, SVG)
    //         .ticks(state.y_axis.ticks.length)
    //         .tickFormat(d => {
    //             let s = state.y_axis.ticks[0]['label'].innerHTML;
    //             return s.includes("M") || s.includes("k") ? d3.format(".2s")(d) : d3.format(",")(d);
    //         });
    //     // state.y_axis.axis(state.y_axis.ticks);
    //         // .tickSize(-state.y_axis.ticks[1].children[0].getAttribute("x2"))
    //         // .ticks(typeof state.y_axis.ticks[0].__data__ === "string" ? state.y_axis.ordinal.length : state.y_axis.ticks.length);
    // }
}
