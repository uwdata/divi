import { min, max, mean } from 'd3-array';
import { scaleTime, scaleBand, scaleLinear } from 'd3-scale';
import { AxisDomainRole, TitleRole, Bottom, CenterX, CenterY, Left, LegendRole, 
    MarkRole, OrphanTickRole, Right, RoleProperty, Tick, Top, ViewportRole } from '../state/constants';
import { axisBottom, axisLeft } from '../_d3/axis';
import { getFormatVal } from './attribute-parsers';
import { computeCenterPos, convertPtToPx, sortByViewPos } from '../util/util';
import { bindLegendData, parseLegends } from './legend-parsers';

const epsilon = 3;
const viewEpsilon = 25;

export function parseChart(state) {
    let [candidateTextGroups, candidateTickGroups, candidateLegendGroups] = collectCandidateGroups(state.textMarks, state.svgMarks);
    let axes = pruneGroups(candidateTextGroups, candidateTickGroups);

    if (axes.length >= 2) {
        axes = [axes[0], axes[1]];
        groupAxes(axes);
        candidateTextGroups = candidateTextGroups.filter(d => !axes.map(a => a.text).includes(d.marks));
    }

    const legends = pruneGroups(candidateTextGroups, candidateLegendGroups, false).filter(d => d.dist < epsilon * 10);
    if (legends.length) {
        parseLegends(state, legends);
        candidateTextGroups = candidateTextGroups.filter(d => !legends.map(l => l.text).includes(d.marks));
    }
    assignTitles(candidateTextGroups.map(d => d.marks).flat());

    function assignTitles(titles) {
        const titleAssignment = new Map();

        function calculatePos(el) {
            const elBBox = el._getBBox();
            return [elBBox.centerX, elBBox.centerY];
        }

        function getClosestTitle(x, y) {
            let closestTitle = { title: null, dist: Number.MAX_SAFE_INTEGER };
            for (const title of titles) {
                const [titleX, titleY] = calculatePos(title);
                const posDiff = Math.abs(titleX - x) + Math.abs(titleY - y);

                if (posDiff < closestTitle.dist) {
                    closestTitle = { title: title, dist: posDiff };
                }
            }

            return closestTitle;
        }

        const groups = [state.xAxis, state.yAxis, ...state.legends];
        for (const group of groups) {
            const _g = 'ticks' in group ? group.ticks : group.marks;
            const pos = _g.filter(d => d.label).map(mark => calculatePos(mark.label));
            const x = mean(pos.map(d => d[0])), y = mean(pos.map(d => d[1]));

            const titleGroup = getClosestTitle(x, y);
            const { title, dist } = titleGroup;
            if (!title) continue;

            if (!titleAssignment.has(title) || dist < titleAssignment.get(title).dist) {
                group.title = title;
                title[RoleProperty] = TitleRole;
                titleAssignment.set(title, titleGroup);
            }
        }

        state.title = titles.filter(d => !d[RoleProperty])[0];
    }

    function groupAxes(axes) {
        axes = [axes[0], axes[1]]; 
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

        for (const { alignment, group} of axes) {
            for (const g of group) {
                const [axis, allTicks] = g;
                const seen = new Map();

                for (const [text, tick] of axis) {
                    seen.set(tick, true);
                    axisMap.has(text) ? axisMap.get(text).ticks.push(tick) 
                        : axisMap.set(text, { alignment: alignment, ticks: [tick] });
                }

                allTicks.filter(d => !seen.has(d)).forEach(d => {
                    orphanTicks.push({ alignment: alignment, tick: d });
                });
            }
        }

        for (const [text, { alignment, ticks }] of axisMap) {
            addTicks(text, alignment, ticks);
        }
        
        for (const { alignment, tick } of orphanTicks) {
            addTicks(null, alignment, [tick]);
        }

        [state.xAxis, state.yAxis].forEach(axis => sortByViewPos('label', axis.ticks));
    }

    function mergeArray(array) { // Assumes [key, mark] structure
        array.sort((a, b) => a[0] - b[0]);
        const groups = [ [array[0][0], [array[0][1]]] ];

        for (let i = 1; i < array.length; ++i) {
            const index = groups[groups.length - 1][0];

            if (Math.abs(index - array[i][0]) < epsilon) {
                groups[groups.length - 1][1].push(array[i][1]);
            } else {
                groups.push([array[i][0], [array[i][1]]]);
            }
        }

        return groups.map(d => d[1]);
    }

    function pruneGroups(candidateTextGroups, candidateMarkGroups, append=true) {
        function _sort(alignment, group) {
            group.sort((a, b) => {
                const aBox = a._getBBox(), bBox = b._getBBox();
                return hs.includes(alignment) ? aBox[CenterX] - bBox[CenterX] : aBox[CenterY] - bBox[CenterY];
            });
        }

        function getGroupDistance(groupA, groupB, alignment) {
            let distsA = [0, 0, 0], distsB = [0, 0, 0];

            function addVal(obj, mark, length) {
                const bbox = mark._getBBox();
                const keys = vs.includes(alignment) ? vs : hs;
                for (let i = 0; i < keys.length; ++i) {
                    obj[i] = obj[i] + (bbox[keys[i]] / length);
                }
            }

            groupA.forEach(d => addVal(distsA, d, groupA.length));
            groupB.forEach(d => addVal(distsB, d, groupB.length));

            return min([
                min(distsA) - min(distsB),
                min(distsA) - max(distsB),
                max(distsA) - min(distsB),
                max(distsA) - max(distsB)
            ].map(d => Math.abs(d)));
        }

        function matchGroup(alignment, textGroup, tickGroup) {
            let i = 0, distance = 0, textMap = new Map();

            for (const text of textGroup) {
                const textBB = text._getBBox();
                let prevDist = Number.MAX_SAFE_INTEGER;

                if (i === tickGroup.length) return [Number.MAX_SAFE_INTEGER, null];

                while (i <= tickGroup.length) {
                    const tickBB = tickGroup[min([i, tickGroup.length - 1])]._getBBox();
                    const key = hs.includes(alignment) ? CenterX : CenterY;
                    const dist = Math.abs(tickBB[key] - textBB[key]);

                    if (dist >= prevDist) {
                        textMap.set(text, tickGroup[i - 1]);
                        distance += prevDist;
                        break;
                    }

                    prevDist = dist;
                    ++i;
                }
            }

            return [distance / textGroup.length, textMap];
        }

        const groups = [], others = [], vs = [Left, Right, CenterX], hs = [Top, Bottom, CenterY];;
        for (const { alignment, marks: textGroup } of candidateTextGroups) {
            if (textGroup.length === 1) {
                others.push([alignment, textGroup]);
                continue;
            }

            let minGroup = { dist: Number.MAX_SAFE_INTEGER, group: null };
            _sort(alignment, textGroup);
            
            for (const { alignment: markAlignment, marks: markGroup } of candidateMarkGroups) {
                if (markGroup.length < textGroup.length) continue;
                if ((vs.includes(alignment) && !vs.includes(markAlignment)) || 
                    (hs.includes(alignment) && !hs.includes(markAlignment))) continue;
                if (getGroupDistance(textGroup, markGroup, alignment) > viewEpsilon) continue;

                _sort(alignment, markGroup);
                const [_dist, textMap] = matchGroup(alignment, textGroup, markGroup);
                if (_dist === Number.MAX_SAFE_INTEGER) continue;

                const withinEp = Math.abs(_dist - minGroup.dist) < epsilon;
                if (append && withinEp) {
                    minGroup.group.push([textMap, markGroup]);
                } else if ((!append && withinEp && markGroup.length < minGroup.group[0][1].length) || _dist < minGroup.dist) {
                    minGroup = { alignment: alignment, dist: _dist, group: [[textMap, markGroup]], text: textGroup };
                }
            }

            if (minGroup.group) groups.push(minGroup);
        }

        groups.sort((a, b) => a.dist - b.dist);
        return groups;
    }

    function collectCandidateGroups(textMarks, svgMarks) {
        function getPositions(allMarks, useCenters=true) {
            const positions = { [Left]: [], [Right]: [], [Top]: [], [Bottom]: [] };
            if (useCenters) {
                positions[CenterX] = [];
                positions[CenterY] = [];
            }
            
            // Detect text groups
            for (const mark of allMarks) {
                const bbox = mark._getBBox();
                for (const [position, array] of Object.entries(positions)) {
                    const offset = bbox[position];
                    array.push([offset, mark]);
                }
            }

            return positions;
        }

        function mergePositions(positions, useStyle=false) {
            const _positions = [];
            if (useStyle) {
                const keys = [CenterX, CenterY];
                for (const key of keys) {
                    const array = positions[key];
                    const styles = { };
                    array.forEach(([key, d]) => {
                        const bbox = d._getBBox();
                        const style = window.getComputedStyle(d);
                        const styleKey = [bbox.width, bbox.height, style.fill, style.color, style.stroke].join(',');
                        styleKey in styles ? styles[styleKey].push([key, d]) : styles[styleKey] = [[key, d]];
                    });

                    Object.values(styles).forEach(d => _positions.push([key, mergeArray(d)]));
                }
            } else {
                for (const [key, array] of Object.entries(positions)) {
                    _positions.push([key, mergeArray(array)]);
                }
            }

            return _positions;
        }

        function assignGroups(allMarks, positions) {
            // Assign each text element to its largest found group
            const markAssignment = new Map();
            const alignmentMap = new Map();
            for (const [alignment, candidateGroups] of positions) {
                for (const group of candidateGroups) {
                    for (const mark of group) {
                        const assignment = markAssignment.get(mark);

                        if (!assignment || group.length > assignment.length) {
                            markAssignment.set(mark, group);
                            alignmentMap.set(group, alignment);
                        }
                    }
                }
            }

            // Compute all candidate groups
            const candidateGroups = [];
            for (let i = 0; i < allMarks.length; ++i) {
                const mark = allMarks[i];
                const marks = markAssignment.get(mark);
                
                if (!candidateGroups.includes(marks)) {
                    candidateGroups.push(marks);
                }
            }

            // Remove duplicates
            for (let i = 0; i < candidateGroups.length; ++i) {
                for (const mark of [...candidateGroups[i]]) {
                    if (markAssignment.get(mark) !== candidateGroups[i]) {
                        candidateGroups[i].splice(candidateGroups[i].indexOf(mark), 1);
                    }
                }
            }

            return candidateGroups.map(d => {
                return { alignment: alignmentMap.get(d), marks: d };
            });
        }

        const textGroups = assignGroups(textMarks, mergePositions(getPositions(textMarks, false)));
        const markPositions = getPositions(svgMarks);
        const tickGroups = assignGroups(svgMarks, mergePositions(markPositions, true)), 
            legendGroups = mergePositions(markPositions).map(([k, v]) => v.map(d => { return { alignment: k, marks: d }; })).flat();

        return [textGroups, tickGroups, legendGroups];
    }
}

export function cleanMarks(state) {
    for (const mark of state.svgMarks) {
        const clientRect = mark._getBBox();
        if (clientRect.width >= state.xAxis.range[1] - state.xAxis.range[0] &&
            clientRect.height >= state.yAxis.range[0] - state.yAxis.range[1]) {
                mark[RoleProperty] = ViewportRole;
                continue;
            }
        const svgR = state.svg._getBBox();
        const [xLeft, xRight] = state.xAxis.range;
        const [yBottom, yTop] = state.yAxis.range.map(d => d + svgR.top);
        if ((clientRect.left <= xLeft && clientRect.right >= xRight && clientRect.bottom <= yTop) || 
            (clientRect.left <= xLeft && clientRect.right >= xRight && clientRect.top >= yBottom) ||
            (clientRect.top <= yTop && clientRect.bottom >= yBottom && clientRect.left <= xLeft) ||
            (clientRect.top <= yTop && clientRect.bottom >= yBottom && clientRect.right >= xRight) ||
            !(clientRect.right >= xLeft && clientRect.left <= xRight && clientRect.bottom >= yTop && clientRect.top <= yBottom)) {
                mark[RoleProperty] = AxisDomainRole;
            }
        for (const legend of state.legends) {
            for (const {mark} of legend.marks) {
                mark[RoleProperty] = LegendRole;
            }
        }
    }

    state.svgMarks = state.svgMarks.filter(d => !d[RoleProperty]);
    state.svgMarks.forEach(d => d[RoleProperty] = MarkRole);
    sortByViewPos(null, state.svgMarks, false);
}

export function computeDomain(axis) {
    let isDate = true;
    for (const [_, value] of Object.entries(axis.ticks)) {
        if (value.label == null) continue;
        if (Object.prototype.toString.call(getFormatVal(value.label, true).value) !== '[object Date]') {
            isDate = false;
            break;
        }
    }

    for (const [_, value] of Object.entries(axis.ticks)) {
        if (!value.label) continue;

        let formatVal = getFormatVal(value.label, isDate);
        if (formatVal.value) {
            axis.formatter = { format: formatVal.format };
            formatVal = formatVal.value;
        }
        value.value = formatVal;

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
            state.xAxis.ticks.filter(d => d.value == state.xAxis.domain[0])[0].marks[0], Left
        );
        const tickRight = computeCenterPos(
            state.xAxis.ticks.filter(d => d.value == state.xAxis.domain[1])[0].marks[0], Left
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
            state.yAxis.ticks.filter(d => d.value == state.yAxis.domain[0])[0].marks[0], Top
        );
        const tickBottom = computeCenterPos(
            state.yAxis.ticks.filter(d => d.value == state.yAxis.domain[1])[0].marks[0], Top
        );

        const ticks = [tickTop, tickBottom].map(d => d - svgClientRect.top);
        const newDomainY = state.yAxis.range.map(
            state.yAxis.scale.copy().range(ticks).invert, state.yAxis.scale
        );

        state.yAxis.scale.domain(newDomainY);
    }
}

export function deconstructChart(state) {
    parseChart(state);
    computeDomain(state.xAxis);
    computeDomain(state.yAxis);

    let width = +convertPtToPx(state.svg.getAttribute('width'));
    let height = +convertPtToPx(state.svg.getAttribute('height'));
    if (!width) width = state.svg._getBBox().width;
    if (!height) height = state.svg._getBBox().height;
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
