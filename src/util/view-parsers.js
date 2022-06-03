import { min, max, mean } from 'd3-array';
import { text } from 'd3-fetch';
import { scaleTime, scaleBand, scaleLinear } from 'd3-scale';
import { Bottom, CategoricalColorLegend, Left, Right, SizeLegend, Top } from '../state/constants';
import { axisBottom, axisLeft } from '../_d3/axis';
import { getFormatVal } from './attribute-parsers';
import { computeCenterPos, flattenRGB } from './util';

const epsilon = 5;

export function identifyAxes(state) {
    function parseLegends(legends) {
        for (const legend of legends) {
            const mark1Style = window.getComputedStyle(legend.marks[0].mark);
            const mark2Style = window.getComputedStyle(legend.marks[1].mark);
            let matchingAttr = null;

            if (mark1Style.fill !== mark2Style.fill) {
                matchingAttr = 'fill';
            } else if (mark1Style.color !== mark2Style.color) {
                matchingAttr = 'color';
            } else if (mark1Style.stroke !== mark2Style.stroke) {
                matchingAttr = 'stroke';
            }

            if (matchingAttr) {
                legend.type = CategoricalColorLegend;
                legend.matchingAttr = matchingAttr;
            } else {
                legend.type = SizeLegend;
            }

            for (const {mark} of legend.marks) {
                mark.role = 'legend';
                mark.legend = legend;
            }

            state.legends.push(legend);
        }
    }

    function assignTitles(titles) {
        function calculatePos(el) {
            const elBB = el.getBoundingClientRect();
            return [elBB.left + elBB.width / 2, elBB.top + elBB.height / 2];
        }

        function getClosestTitle(x, y) {
            const closestTitle = {title: null, distance: Number.MAX_VALUE};
            for (const title of titles) {
                const [titleX, titleY] = calculatePos(title);
                const posDiff = Math.abs(titleX - x) + Math.abs(titleY - y);

                if (posDiff < closestTitle.distance) {
                    closestTitle.title = title;
                    closestTitle.distance = posDiff;
                }
            }

            return closestTitle.title;
        }

        [state.xAxis, state.yAxis].forEach(axis => {
            const axisPos = axis.ticks.filter(d => d.label).map(tickGroup => calculatePos(tickGroup.label));
            axis.title = getClosestTitle(mean(axisPos.map(d => d[0])), mean(axisPos.map(d => d[1])));
            if (axis.title) axis.title.role = 'axis-title';
        });
        state.legends.map(legend => {
            const legendPos = legend.marks.filter(d => d.label).map(mark => calculatePos(mark.label));
            legend.title = getClosestTitle(mean(legendPos.map(d => d[0])), mean(legendPos.map(d => d[1])));
            if (legend.title) legend.title.role = 'legend-title';
        });

        state.title = titles.filter(d => !d.role)[0];
    }

    function collectOrphanTicks(orphanTicks) {
        for (const {alignment, tick: orphanTick} of orphanTicks) {
            const isX = alignment === Top || alignment === Bottom;
            const axis = isX ? state.xAxis : state.yAxis;
            const orphanBB = orphanTick.getBoundingClientRect();
            let matched = false;
            
            for (let i = 0; i < axis.ticks.length; ++i) {
                for (const tick of axis.ticks[i].ticks) {
                    const tickBB = tick.getBoundingClientRect();
                    const sizeMatch = isX ? orphanBB.height === tickBB.height : orphanBB.width === tickBB.width;
                    const offset = isX ? Math.abs(orphanBB.left + orphanBB.width / 2 - tickBB.left - tickBB.width / 2)
                    : Math.abs(orphanBB.top + orphanBB.height / 2 - tickBB.top - tickBB.height / 2);
                    
                    if (offset < epsilon && sizeMatch) {
                        matched = true;
                        const orphanStyle = window.getComputedStyle(orphanTick);
                        const tickStyle = window.getComputedStyle(tick);

                        if (parseInt(orphanStyle.strokeWidth, 10) < parseInt(tickStyle.strokeWidth, 10) || 
                            flattenRGB(orphanStyle.stroke) > flattenRGB(tickStyle.stroke)) {
                            axis.ticks[i].ticks = axis.ticks[i].ticks.filter(d => d !== tick);
                            axis.ticks[i].ticks.push(orphanTick);
                        }
                    }
                }
            }

            if (!matched) {
                axis.ticks.push({label: null, ticks: [orphanTick]});
            }
        }
    }

    function groupAxes(axes) {
        const axisMap = new Map();
        const orphanTicks = [];

        for (const [alignment, axis] of axes) {
            for (const {text, tick} of axis) {
                if (!text) {
                    orphanTicks.push({alignment: alignment, tick: tick});
                    continue;
                }

                axisMap.has(text) ? axisMap.get(text).ticks.push(tick) 
                : axisMap.set(text, {alignment: alignment, ticks: [tick]});
            }
        }

        for (const [text, {alignment, ticks}] of axisMap.entries()) {
            if (alignment === Top || alignment === Bottom) {
                state.xAxis.ticks.push({label: text, ticks: ticks});
            } else {
                state.yAxis.ticks.push({label: text, ticks: ticks});
            }
        }
        
        collectOrphanTicks(orphanTicks);
        [state.xAxis.ticks, state.yAxis.ticks].forEach(axis => axis.forEach(
            tickGroup => tickGroup.ticks.forEach(tick => tick.role = 'tick')
        ));
    }

    function collectTicks() {
        const positionMap = {};
        for (const svgMark of state.svgMarks) {
            const markBB = svgMark.getBoundingClientRect();
            const xOffset = 'x:' + [markBB.left, markBB.width, markBB.height].join(',');
            const yOffset = 'y:' + [markBB.top, markBB.width, markBB.height].join(',');
    
            xOffset in positionMap ? positionMap[xOffset].push(svgMark) : positionMap[xOffset] = [svgMark];
            yOffset in positionMap ? positionMap[yOffset].push(svgMark) : positionMap[yOffset] = [svgMark];
        }
    
        return positionMap;
    }

    function collectTextKeys() {
        const groups = new WeakMap();

        for (const textMark of state.textMarks) {
            const group = {closestMark: null, distance: Number.MAX_VALUE};
    
            for (const svgMark of state.svgMarks) {
                const textBB = textMark.getBoundingClientRect();
                const markBB = svgMark.getBoundingClientRect();
    
                const textCenter = {x: textBB.left + textBB.width / 2, y: textBB.top + textBB.height / 2};
                const posDiff = min([
                    Math.abs(textCenter.x - markBB.right) + Math.abs(textCenter.y - markBB.top),
                    Math.abs(textCenter.x - markBB.right) + Math.abs(textCenter.y - markBB.bottom),
                    Math.abs(textCenter.x - markBB.left) + Math.abs(textCenter.y - markBB.top),
                    Math.abs(textCenter.x - markBB.left) + Math.abs(textCenter.y - markBB.bottom)
                ]);
    
                if (posDiff < group.distance) {
                    group.closestMark = svgMark;
                    group.distance = posDiff;
                }
            }

            groups.set(textMark, group);
        }

        return groups;
    }

    function separateOthers(others, textKeys) {
        const legends = [], titles = [];

        for (const [alignment, group] of others) {
            if (group.length === 1) {
                titles.push(...group);
            } else {
                let isLegend = true;
                for (const text of group) {
                    const textBB = text.getBoundingClientRect();
                    const markBB = textKeys.get(text).closestMark.getBoundingClientRect();

                    if (alignment === Left || alignment === Right) {
                        if (textBB.left - markBB.right < 0 && markBB.left - textBB.right < 0) {
                            isLegend = false;
                        }
                    } else if (textBB.top - markBB.bottom < 0 && markBB.top - textBB.bottom < 0) {
                        isLegend = false;
                    }
                }

                if (isLegend) {
                    legends.push({title: '', marks: group.map(text => {
                        return {label: text, mark: textKeys.get(text).closestMark};
                     })});
                } else {
                    titles.push(...group);
                }
            }
        }

        return [legends, titles];
    }

    function pruneGroups(candidateGroups) {
        const axes = [], others = [];
        const tickCandidates = collectTicks();
        const textKeys = collectTextKeys();

        for (const {alignment, marks: textGroup} of candidateGroups) {
            if (textGroup.length === 1) {
                others.push([alignment, textGroup]);
                continue;
            }
            let anyMatched = false;

            for (const [_, tickGroup] of Object.entries(tickCandidates)) {
                if (tickGroup.length < textGroup.length) continue;

                let textMatched = true;
                const tickStyles = {};
                const matchedTicks = new WeakMap();

                for (const text of textGroup) {
                    const textBB = textKeys.get(text).closestMark.getBoundingClientRect();
                    let tickMatch = false; 

                    for (const tick of tickGroup) {
                        const tickBB = tick.getBoundingClientRect();
                        const xOffset = Math.abs(textBB.left + textBB.width / 2 - tickBB.left - tickBB.width / 2);
                        const yOffset = Math.abs(textBB.top + textBB.height / 2 - tickBB.top - tickBB.height / 2);

                        if ((xOffset < epsilon || yOffset < epsilon) && !matchedTicks.get(tick)) {
                            matchedTicks.set(tick, text);
                            tickMatch = true;

                            const style = window.getComputedStyle(tick);
                            const tickStyle = [style.stroke, style.color, style.fill, tickBB.width, tickBB.height].join(',');
                            tickStyles[tickStyle] = tickStyle in tickStyles ? tickStyles[tickStyle] + 1 : 1;
                            break;
                        }
                    }

                    if (!tickMatch) {
                        textMatched = false;
                        break;
                    }
                }

                const styleKey = Object.keys(tickStyles)[0];
                if (textMatched && tickStyles[styleKey] === textGroup.length) {
                    axes.push([alignment, tickGroup.map(d => {
                        return {tick: d, text: matchedTicks.get(d)};
                    })]);
                    anyMatched = true;
                }
            }

            if (!anyMatched) {
                others.push([alignment, textGroup]);
            }
        }

        return [axes, ...separateOthers(others, textKeys)];
    }

    function collectCandidateGroups() {
        const positions = {[Right]: {}, [Left]: {}, [Top]: {}, [Bottom]: {}};

        for (const textMark of state.textMarks) {
            for (const [position, _map] of Object.entries(positions)) {
                const {[position]: offset} = textMark.getBoundingClientRect();
                offset in _map ? _map[offset].push(textMark) : _map[offset] = [textMark];
            }
        }

        const markAssignment = new WeakMap();
        const alignmentMap = new WeakMap();
        for (const [alignment, candidateGroup] of Object.entries(positions)) {
            for (const [_, marks] of Object.entries(candidateGroup)) {
                for (const mark of marks) {
                    if (!markAssignment.get(mark) || marks.length > markAssignment.get(mark).length) {
                        markAssignment.set(mark, marks);
                        alignmentMap.set(marks, alignment);
                    }
                }
            }
        }

        let candidateGroups = [];
        for (const textMark of state.textMarks) {
            const marks = markAssignment.get(textMark);
            if (!candidateGroups.includes(marks)) {
                candidateGroups.push(marks);
            }
        }
        candidateGroups = candidateGroups.map(d => {
            return {alignment: alignmentMap.get(d), marks: d};
        });

        return candidateGroups;
    }
    
    const candidateGroups = collectCandidateGroups();
    const [axes, legends, titles] = pruneGroups(candidateGroups);
    groupAxes(axes);
    parseLegends(legends);
    assignTitles(titles);
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
