import { max, min } from 'd3-array';
import { CenterX, CenterY, OrphanTickRole, RoleProperty, Tick, horizAlign } from '../../state/constants.js';
import { computeCenterPos, sortByViewPos } from '../../util/util.js';
import { getFormatVal } from './data-parser.js';
import { pairGroups } from '../engine/parser-groups.js';
import { scaleBand, scaleLinear, scaleTime } from 'd3-scale';
import { axisBottom, axisLeft } from '../../_d3/axis.js';

// Construct requisite metadata for an inferred axis group.
function describeAxis(axis, container) {
    const { alignment, group } = axis;
    const axisMap = new Map();
    const orphanTicks = [];

    function addTicks(text, ticks) {
        container.ticks.push({ label: text, marks: ticks });
        ticks.forEach(tick => { text ? tick[RoleProperty] = Tick : tick[RoleProperty] = OrphanTickRole; });
    }

    for (const g of group) {
        const [axis, allTicks] = g;
        const seen = new Map();

        // Merge multiple tick marks mapping to a single text mark.
        for (const [text, tick] of axis) {
            seen.set(tick, true);
            axisMap.has(text)
                ? axisMap.get(text).ticks.push(tick)
                : axisMap.set(text, { alignment, ticks: [tick] });
        }

        // Unmatched tick marks are orphan ticks (usually gridlines, e.g., in ggplot2).
        allTicks.filter(d => !seen.has(d)).forEach(d => {
            orphanTicks.push({ alignment, tick: d });
        });
    }

    for (const [text, { ticks }] of axisMap) {
        addTicks(text, ticks);
    }

    for (const { tick } of orphanTicks) {
        addTicks(null, [tick]);
    }

    sortByViewPos('label', container.ticks);
}

// Computer axis domain (data space) extents.
function computeAxisDomain(axis) {
    let isDate = true;

    // Check for date formatting.
    for (const [, value] of Object.entries(axis.ticks)) {
        if (value.label == null) continue;
        if (Object.prototype.toString.call(getFormatVal(value.label, true).value) !== '[object Date]') {
            isDate = false;
            break;
        }
    }

    // Iterate over axis tick values to compute min / max extents.
    for (const [, value] of Object.entries(axis.ticks)) {
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

function computeAxisRange(axis, isX) {
    const axisTicks = axis.ticks;
    const firstTickBBox = axisTicks[0].marks[0].getBBoxCustom();
    const lastTickBBox = axisTicks[axisTicks.length - 1].marks[0].getBBoxCustom();
    axis.range = isX ? [firstTickBBox[CenterX], lastTickBBox[CenterX]] : [lastTickBBox[CenterY], firstTickBBox[CenterY]];
}

function computeScale(state, axis, isX) {
    const { domain } = axis;
    axis.scale = (domain[0] instanceof Date
        ? scaleTime()
        : axis.ordinal.length
            ? scaleBand()
            : scaleLinear())
        .domain(axis.ordinal.length ? axis.ordinal.reverse() : axis.domain)
        .range(axis.range);

    const axisFn = isX ? axisBottom : axisLeft;
    axis.axis = axisFn(axis.scale, state).ticks(axis.ticks.length);
    if (axis.domain[0] instanceof Date) axis.axis = axis.axis.tickFormat(state.xAxis.formatter.format);

    // Reconfigure axis to prevent tick / gridline change.
    if (isX && !axis.ordinal.length) {
        const tickLeft = computeCenterPos(
            axis.ticks.filter(d => d.value === axis.domain[0])[0].marks[0], 'left'
        );
        const tickRight = computeCenterPos(
            axis.ticks.filter(d => d.value === axis.domain[1])[0].marks[0], 'left'
        );

        const ticks = [tickLeft, tickRight].map(d => d);
        const newDomainX = axis.range.map(
            axis.scale.copy().range(ticks).invert, axis.scale
        );

        axis.scale.domain(newDomainX);
    } else if (!isX && !axis.ordinal.length) {
        const tickTop = computeCenterPos(
            axis.ticks.filter(d => d.value === axis.domain[0])[0].marks[0], 'top'
        );
        const tickBottom = computeCenterPos(
            axis.ticks.filter(d => d.value === axis.domain[1])[0].marks[0], 'top'
        );

        const ticks = [tickTop, tickBottom].map(d => d);
        const newDomainY = axis.range.map(
            axis.scale.copy().range(ticks).invert, axis.scale
        );

        axis.scale.domain(newDomainY);
    }
}

export function inferAxes(state, textGroups, markGroups) {
    const { svg, xAxis, yAxis } = state;
    const axes = pairGroups(svg, textGroups, markGroups);

    axes.forEach(a => {
        const isX = horizAlign.includes(a.alignment);
        const axisContainer = isX ? xAxis : yAxis;

        describeAxis(a, axisContainer);
        computeAxisDomain(axisContainer);
        computeAxisRange(axisContainer, isX);
        computeScale(state, axisContainer, isX);
    });

    return axes;
}
