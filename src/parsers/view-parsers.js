import { min, max, mean } from 'd3-array';
import { scaleTime, scaleBand, scaleLinear } from 'd3-scale';
import { AxisDomainRole, AxisTitleRole, Bottom, Left, LegendTitleRole, 
    MarkRole, OrphanTickRole, Right, RoleProperty, Tick, Top, ViewportRole } from '../state/constants';
import { axisBottom, axisLeft } from '../_d3/axis';
import { getFormatVal } from './attribute-parsers';
import { computeCenterPos, convertPtToPx, sortByViewPos } from '../util/util';
import { parseLegends } from './legend-parsers';

const epsilon = 2;

export function parseChart(state) {
    const candidateGroups = collectCandidateTextGroups();
    const [axes, legends, titles] = pruneGroups(candidateGroups);
    groupAxes(axes);
    parseLegends(state, legends);
    assignTitles(titles.filter(d => !d[RoleProperty]));

    function assignTitles(titles) {
        function calculatePos(el) {
            const elBBox = el._getBBox();
            return [elBBox.centerX, elBBox.centerY];
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

        [state.xAxis, state.yAxis].forEach(function(axis) {
            const axisPos = axis.ticks.filter(d => d.label).map(tickGroup => calculatePos(tickGroup.label));
            axis.title = getClosestTitle(mean(axisPos.map(d => d[0])), mean(axisPos.map(d => d[1])));
            if (axis.title) axis.title[RoleProperty] = AxisTitleRole;
        });
        state.legends.map(function(legend) {
            const legendPos = legend.marks.filter(d => d.label).map(mark => calculatePos(mark.label));
            legend.title = getClosestTitle(mean(legendPos.map(d => d[0])), mean(legendPos.map(d => d[1])));
            if (legend.title) legend.title[RoleProperty] = LegendTitleRole;
        });

        state.title = titles.filter(d => !d[RoleProperty])[0];
    }

    function groupAxes(axes) {
        console.log(axes)
        const axisMap = new Map();
        const orphanTicks = [];

        function addTicks(text, alignment, ticks) {
            if (alignment === Top || alignment === Bottom) {
                state.xAxis.ticks.push({label: text, marks: ticks});
            } else {
                state.yAxis.ticks.push({label: text, marks: ticks});
            }
            ticks.forEach(tick => text ? tick[RoleProperty] = Tick : tick[RoleProperty] = OrphanTickRole)
        }

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
            addTicks(text, alignment, ticks);
        }
        
        if (orphanTicks.length >= axisMap.size - 1) {
            for (const {alignment, tick} of orphanTicks) {
                addTicks(null, alignment, [tick]);
            }
        }

        [state.xAxis, state.yAxis].forEach(axis => sortByViewPos('label', axis.ticks, typeof getFormatVal(axis.ticks[0].label) !== 'string'));
    }

    function collectCandidateTicks() {
        const positionMap = {};
        for (const svgMark of state.svgMarks) {
            const bbox = svgMark._getBBox();
            const xOffset = 'x,' + [bbox.centerX, bbox.width, bbox.height].join(',');
            const yOffset = 'y,' + [bbox.centerY, bbox.width, bbox.height].join(',');

            let foundX = false, foundY = false;
            for (const _key of Object.keys(positionMap)) { // Handle minor misalignments / offsets
                const [axis, offset, width, height] = _key.split(',');

                if (axis === 'x' && +width === bbox.width && +height === bbox.height && Math.abs(bbox.centerX - offset) < epsilon) {
                    foundX = true;
                    positionMap[_key].push(svgMark);
                }
                if (axis === 'y' && +width === bbox.width && +height === bbox.height && Math.abs(bbox.centerY - offset) < epsilon) {
                    foundY = true;
                    positionMap[_key].push(svgMark);
                }
            }

            if (!foundX) positionMap[xOffset] = [svgMark];
            if (!foundY) positionMap[yOffset] = [svgMark];
        }
    
        return positionMap;
    }

    function collectTextKeys() {
        const groups = new WeakMap();

        for (const textMark of state.textMarks) {
            const textBBox = textMark._getBBox();
            const group = { closestMark: null, distance: Number.MAX_VALUE };
    
            for (const svgMark of state.svgMarks) {
                const markBBox = svgMark._getBBox();
                const posDiff = (markBBox.width <= 1 && markBBox.height > 10) || (markBBox.height <= 1 && markBBox.width > 10) 
                    ? min([
                        Math.abs(textBBox.centerX - markBBox.right) + Math.abs(textBBox.centerY - markBBox.top),
                        Math.abs(textBBox.centerX - markBBox.right) + Math.abs(textBBox.centerY - markBBox.bottom),
                        Math.abs(textBBox.centerX - markBBox.left) + Math.abs(textBBox.centerY - markBBox.top),
                        Math.abs(textBBox.centerX - markBBox.left) + Math.abs(textBBox.centerY - markBBox.bottom)
                    ])
                    : Math.abs(textBBox.centerX - markBBox.centerX) + Math.abs(textBBox.centerY - markBBox.centerY);
    
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
                    const textBBox = text._getBBox();
                    const markBBox = textKeys.get(text).closestMark._getBBox();

                    if (alignment === Left || alignment === Right) {
                        if (textBBox.left - markBBox.right < 0 && markBBox.left - textBBox.right < 0) {
                            isLegend = false;
                        }
                    } else if (textBBox.top - markBBox.bottom < 0 && markBBox.top - textBBox.bottom < 0) {
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
        const tickCandidates = collectCandidateTicks(); // Get SVG candidate tick groups
        const textKeys = collectTextKeys(); // Get closest mark to each text element

        for (const {alignment, marks: textGroup} of candidateGroups) {
            if (textGroup.length === 1) {
                others.push([alignment, textGroup]);
                continue;
            }
            let anyMatched = false;
            
            for (const [P, tickGroup] of Object.entries(tickCandidates)) {
                if (tickGroup.length < textGroup.length) continue;
                // if (tickGroup.length > 12) console.log(P, textGroup, tickGroup)
                let textMatched = true;
                const tickStyles = { };
                const matchedTicks = new WeakMap();  

                for (const text of textGroup) {
                    const textBBox = textKeys.get(text).closestMark._getBBox();
                    // console.log(text, textKeys.get(text).closestMark)
                    let tickMatch = false; 

                    for (const tick of tickGroup) {
                        const tickBBox = tick._getBBox();
                        const xOffset = Math.abs(tickBBox.centerX - textBBox.centerX);
                        const yOffset = Math.abs(tickBBox.centerY - textBBox.centerY);

                        if (((xOffset < epsilon && tickBBox.width < epsilon) || (yOffset < epsilon && tickBBox.height < epsilon)) 
                            && !matchedTicks.get(tick)) {
                                matchedTicks.set(tick, text);
                                tickMatch = true;

                                const style = window.getComputedStyle(tick);
                                const tickStyle = [style.stroke, style.color, style.fill, tickBBox.width, tickBBox.height].join(',');
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

    function collectCandidateTextGroups() {
        const positions = {[Right]: {}, [Left]: {}, [Top]: {}, [Bottom]: {}};

        // Detect text groups
        for (const textMark of state.textMarks) {
            const textBBox = textMark._getBBox();
            for (const [position, _map] of Object.entries(positions)) {
                const offset = textBBox[position];
                let found = false;
                
                for (const _key of Object.keys(_map)) { // Handle minor misalignments / offsets
                    if (Math.abs(offset - _key) < epsilon) {
                        found = true;
                        _map[_key].push(textMark);
                    }
                }

                if (!found) _map[offset] = [textMark];
            }
        }

        // Assign each text element to its largest found group
        const markAssignment = new WeakMap();
        const alignmentMap = new WeakMap();
        for (const [alignment, candidateGroup] of Object.entries(positions)) {
            for (const [_, marks] of Object.entries(candidateGroup)) {
                for (const mark of marks) {
                    const assignment = markAssignment.get(mark);

                    // Remove mark from smaller candidate groups to avoid duplicates
                    if (assignment && marks.length > assignment.length) {
                        assignment.splice(assignment.indexOf(mark), 1);
                    }

                    if (!assignment || marks.length > assignment.length) {
                        markAssignment.set(mark, marks);
                        alignmentMap.set(marks, alignment);
                    }
                }
            }
        }

        // Compute all candidate groups
        let candidateGroups = [];
        for (let i = 0; i < state.textMarks.length; ++i) {
            const textMark = state.textMarks[i];
            const marks = markAssignment.get(textMark);
            
            if (!candidateGroups.includes(marks)) {
                candidateGroups.push(marks);
            }
        }

        return candidateGroups.map(d => {
            return {alignment: alignmentMap.get(d), marks: d};
        });
    }
}

export function cleanMarks(state) {
    for (const mark of state.svgMarks) {
        const clientRect = mark._getBBox()
        if (clientRect.width >= state.xAxis.range[1] - state.xAxis.range[0] &&
            clientRect.height >= state.yAxis.range[0] - state.yAxis.range[1]) {
                mark[RoleProperty] = ViewportRole;
                continue;
            }
        
        const xLeft = state.xAxis.ticks[0].marks[0]._getBBox().left;
        const xRight = state.xAxis.ticks[state.xAxis.ticks.length - 1].marks[0]._getBBox().right;
        const yTop = state.yAxis.ticks[state.yAxis.ticks.length - 1].marks[0]._getBBox().top;
        const yBottom = state.yAxis.ticks[0].marks[0]._getBBox().bottom;

        if ((clientRect.left <= xLeft && clientRect.right >= xRight && clientRect.top >= yBottom) || 
            (clientRect.top <= yTop && clientRect.bottom >= yBottom && clientRect.right <= xLeft)) {
                mark[RoleProperty] = AxisDomainRole;
            }
    }

    state.svgMarks = state.svgMarks.filter(d => !d[RoleProperty]);
    state.svgMarks.forEach(d => d[RoleProperty] = MarkRole);
    sortByViewPos(null, state.svgMarks, false);
}

export function computeDomain(axis) {
    for (const [_, value] of Object.entries(axis.ticks)) {
        if (!value.label) continue;
        const formatVal = getFormatVal(value.label);

        if (typeof formatVal === 'string') {
            axis.ordinal.push(formatVal);
        } else {
            axis.domain[0] = axis.domain[0] === null ? formatVal : min([axis.domain[0], formatVal]);
            axis.domain[1] = axis.domain[1] === null ? formatVal : max([axis.domain[1], formatVal]);
        }
    }
}

export function configureAxes(state) {
    const svgClientRect = state.svg._getBBox();

    if (state.xAxis.scale && !state.xAxis.ordinal.length) {
        // Infer original X-axis domains
        
        const tickLeft = computeCenterPos(
            state.xAxis.ticks.filter(d => String(getFormatVal(d.label)) === String(state.xAxis.domain[0]))[0].marks[0], Left
        );
        const tickRight = computeCenterPos(
            state.xAxis.ticks.filter(d => String(getFormatVal(d.label)) === String(state.xAxis.domain[1]))[0].marks[0], Left
        );

        const ticks = [tickLeft, tickRight].map(d => d - svgClientRect.left);
        const newDomainX = state.xAxis.range.map(
            state.xAxis.scale.copy().range(ticks).invert, state.xAxis.scale
        );
        
        state.xAxis.scale.domain(newDomainX);
    }

    if (state.yAxis.scale && !state.yAxis.ordinal.length) {
        // Infer original Y-axis domain
        const tickTop = computeCenterPos(
            state.yAxis.ticks.filter(d => getFormatVal(d.label) === state.yAxis.domain[0])[0].marks[0], Top
        );
        const tickBottom = computeCenterPos(
            state.yAxis.ticks.filter(d => getFormatVal(d.label) === state.yAxis.domain[1])[0].marks[0], Top
        );

        const ticks = [tickTop, tickBottom].map(d => d - svgClientRect.top);
        const newDomainY = state.yAxis.range.map(
            state.yAxis.scale.copy().range(ticks).invert, state.yAxis.scale
        );

        state.yAxis.scale.domain(newDomainY);
    }
    console.log(state.yAxis.scale.domain(), state.yAxis.scale.range())
}

export function deconstructChart(state) {
    parseChart(state);
    computeDomain(state.xAxis);
    computeDomain(state.yAxis);

    const width = +convertPtToPx(state.svg.getAttribute('width'));
    const height = +convertPtToPx(state.svg.getAttribute('height'));
    const svgBBox = state.svg._getBBox();

    if (!state.xAxis.ticks.length && !state.yAxis.ticks.length) {
        state.xAxis.range = [0, width];
        state.yAxis.range = [height, 0];
        cleanMarks(state);
        return;
    }
    
    /* TODO: More robust axis ranges */
    const yTick = state.yAxis.ticks[0].marks[0];
    const yTickBB = yTick._getBBox();
    const xTick = state.xAxis.ticks[0].marks[0];
    const xTickBB = xTick._getBBox(); 

    const yTickRange = [yTickBB.left, yTickBB.left + yTickBB.width];
    const xTickRange = [xTickBB.top + xTickBB.height, xTickBB.top];
    
    const xMin = max([(yTickBB.width < 10 ? yTickRange[1] : yTickRange[0]) - svgBBox.left, 0]);
    const xMax = max([min([yTickRange[1] - svgBBox.left, width]), state.xAxis.ticks[state.xAxis.ticks.length - 1].marks[0]._getBBox().right - svgBBox.left]);
    const yMin = max([(xTickBB.height < 10 ? state.yAxis.ticks[state.yAxis.ticks.length - 1].marks[0]._getBBox().top : xTickRange[1]) - svgBBox.top, 0]);
    const yMax = min([xTickRange[0] - svgBBox.top, height]);
    
    state.xAxis.range = [xMin, xMax];
    state.yAxis.range = [yMax, yMin];

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
    cleanMarks(state);
    
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
