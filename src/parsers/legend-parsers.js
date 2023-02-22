import { scaleLinear, scaleOrdinal } from "d3-scale";
import { CategoricalColorLegend, ColorAttr, FillAttr, Legend, LegendRole, RoleProperty, SizeLegend, StrokeAttr } from "../state/constants";
import { sortByViewPos } from "../util/util";

function inferScale(legend) {
    var scale;
    
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

export function parseLegends(state, legends) {
    for (const legend of legends) {
        const mark1Style = window.getComputedStyle(legend.marks[0].mark);
        const mark2Style = window.getComputedStyle(legend.marks[1].mark);
        let matchingAttr = null;

        if (mark1Style.fill !== mark2Style.fill) {
            matchingAttr = FillAttr;
        } else if (mark1Style.color !== mark2Style.color) {
            matchingAttr = ColorAttr;
        } else if (mark1Style.stroke !== mark2Style.stroke) {
            matchingAttr = StrokeAttr;
        }

        if (matchingAttr) {
            legend.type = CategoricalColorLegend;
            legend.matchingAttr = matchingAttr;
        } else {
            legend.type = SizeLegend;
        }

        for (const {label, mark} of legend.marks) {
            label[RoleProperty] = mark[RoleProperty] = LegendRole;
            mark.legend = legend;
            mark.style['pointer-events'] = 'fill';
        }

        inferScale(legend);
        sortByViewPos('label', legend.marks, legend.type === SizeLegend);
        state.legends.push(legend);
    }
}
