import { max, mean, min } from 'd3-array';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import {
    CategoricalColorLegend, DataAttr, LegendRole, OpacityField, RoleProperty,
    SelectOpacity, SizeLegend
} from '../../state/constants.js';
import { sortByViewPos } from '../../util/util.js';
import { pairGroups } from '../engine/parser-groups.js';

// Invert band scale (categorical as position encoding).
export function invertBand(scale, value) {
    const step = scale.step();
    const start = scale(scale.domain()[0]) + scale.paddingOuter() * step;
    const bandwidth = scale.bandwidth();

    let index = Math.round(Math.abs((value - start - bandwidth / 2)) / step);
    index = max([0, min([scale.domain().length - 1, index])]);
    return scale.domain()[scale.domain().length - 1 - index];
}

// Invert categorical / ordinal scale.
export function invertOrdinal(scale, value) {
    return scale.domain()[scale.range().indexOf(value)];
}

function bindLegendData(legend) {
    const { scale, title, type, matchingAttr } = legend;
    for (const { mark } of legend.marks) {
        const style = type === CategoricalColorLegend
            ? window.getComputedStyle(mark)[matchingAttr]
            : mark.getBBoxCustom().width ** 2;

        const data = invertOrdinal(scale, style);
        mark[DataAttr] = { [title ? title.innerHTML.toLowerCase() : 'legend-0']: data };
    }
}

function inferScale(legend) {
    let scale;
    if (legend.type === CategoricalColorLegend) { // Ordinal legends
        const domain = legend.marks.map(d => d.label.innerHTML);
        const range = legend.marks.map(d => window.getComputedStyle(d.mark)[legend.matchingAttr]);
        scale = scaleOrdinal().domain(domain).range(range);
    } else { // Size legend
        const domain = legend.marks.map(d => +d.label.innerHTML);
        const range = legend.marks.map(d => d.mark._getBBox().width ** 2);
        scale = scaleLinear().domain(domain).range(range);
    }

    legend.scale = scale;
}

function formatLegend(legend) {
    const group = Array.from(legend.group[0][0]);
    return {
        title: null,
        marks: group.map(([text, mark]) => {
            return { label: text, mark };
        })
    };
}

function parseLegends(state, legends) {
    for (let legend of legends) {
        legend = formatLegend(legend);
        const mark1Style = window.getComputedStyle(legend.marks[0].mark);
        const mark2Style = window.getComputedStyle(legend.marks[1].mark);
        let matchingAttr = null;

        // Infer legend type (color, size, shape).
        if (mark1Style.stroke !== mark2Style.stroke) {
            matchingAttr = 'stroke';
        } else if (mark1Style.color !== mark2Style.color) {
            matchingAttr = 'color';
        } else if (mark1Style.fill !== mark2Style.fill) {
            matchingAttr = 'fill';
        }

        if (matchingAttr) {
            legend.type = CategoricalColorLegend;
            legend.matchingAttr = matchingAttr;
        } else {
            const widths = []; const heights = [];
            for (let i = 1; i < legend.marks.length; ++i) {
                const bbox1 = legend.marks[i - 1].mark.getBBoxCustom();
                const bbox2 = legend.marks[i].mark.getBBoxCustom();
                widths.push(Math.abs(bbox1.width - bbox2.width));
                heights.push(Math.abs(bbox1.height - bbox2.height));
            }

            if (mean(widths) > 2 || mean(heights) > 2) {
                legend.type = SizeLegend;
            } else { // Remove legend.
                legends.splice(legends.indexOf(legend), 1);
                return;
            }
        }

        // Update legend mark properties.
        for (const { label, mark } of legend.marks) {
            label[RoleProperty] = mark[RoleProperty] = LegendRole;
            mark.style['pointer-events'] = 'fill';
            mark.legend = legend;
            mark[OpacityField] = mark.hasAttribute('opacity')
                ? +mark.getAttribute('opacity')
                : window.getComputedStyle(mark).opacity || SelectOpacity;
        }

        inferScale(legend);
        sortByViewPos('label', legend.marks, legend.type === SizeLegend);
        state.legends.push(legend);
    }
}

export function inferLegends(state, textGroups, markGroups) {
    const legends = pairGroups(textGroups, markGroups, false);
    if (legends.length) {
        parseLegends(state, legends);
        legends.forEach(l => bindLegendData(l));
    }
    return legends;
}
