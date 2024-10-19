import { path } from 'd3-path';
import { select, selectAll } from 'd3-selection';
import { LINK_TYPES } from '../parsers/multi-view/link-parser.js';
import {
    DataAttr, LegendRole, MarkRole, OpacityField, RoleProperty,
    SelectOpacity, tableIndexField, tableMarkField, UnselectOpacity
} from '../state/constants.js';
import { generatePredicates, SELECT_TYPE } from './query.js';

function setSelection(marks, opacity) {
    selectAll(marks).attr('opacity', opacity);
}

export function selectAllMarks(marks) {
    setSelection(marks, marks[0][OpacityField] || SelectOpacity);
}

function unselectAllMarks(marks) {
    setSelection(marks, UnselectOpacity);
}

export function selectMarks(allMarks, marks) {
    unselectAllMarks(allMarks);
    setSelection(marks, SelectOpacity);
}

function selectLegends(legends, data) {
    for (const legend of legends) {
        if (!legend.title) continue;
        const attr = legend.title.innerHTML.toLowerCase();
        const attrData = data.array(attr);
        if (attr === 'precipitation') continue;
        const _marks = legend.marks
            .filter(d => attrData.includes(d.mark[DataAttr][attr]))
            .map(d => d.mark);

        selectMarks(legend.marks.map(d => d.mark), _marks);
    }
}

function drawAggregates(id, selected, xAxis) {
    const marks = selected.array(tableMarkField);
    selectAll('.' + id + '.AGGREGATE_LAYER').remove();
    const newMarks = [];

    for (let i = 0; i < marks.length; ++i) {
        const markRect = marks[i]._getBBox();
        const newMark = select(marks[i].parentElement).append('path').classed(id, true)
            .classed('AGGREGATE_LAYER', true)
            .attr('fill', window.getComputedStyle(marks[i]).fill);

        if (marks[i].tagName === 'path') {
            const x = marks[i].contour[0].x; //, y = marks[i].contour[0].y;
            // if (marks[i].globalPosition.translate.y) {
            // var y = marks[i].globalPosition.translate.y - marks[i].globalPosition.translate.y / 2;
            // console.log(x, y)
            // } else {
            const y = marks[i].contour[0].y - marks[i]._getBBox().height;
            // const lx = marks[i].globalPosition.translate.x - marks[i].globalPosition.translate.x / 2,
            //     ly = marks[i].globalPosition.translate.y - marks[i].globalPosition.translate.y / 2;
            // const t = marks[i].localTransform;
            // const x =
            // }
            const h = markRect.height;
            const w = xAxis.scale(selected.array(xAxis.title.innerHTML.toLowerCase())[i]) - xAxis.range[0];

            const p = path();
            p.rect(x, y, w, h);
            newMark.attr('d', p.toString());
            newMarks.push(newMark);
        }
    }

    selectAll([...marks, ...newMarks]).raise();
}

export function applySelections(states) {
    for (const state of states) {
        const { data, legends, xAxis } = state;
        const { table, active } = data;
        const { selected, type } = active;

        let selectedMarks = selected.array(tableMarkField);

        if (type === LINK_TYPES.AGGREGATE) {
            selectedMarks = drawAggregates(state.svg.id, selected, xAxis);
        } else {
            selectAll('.' + state.svg.id + 'AGGREGATE_LAYER').remove();
        }
        selectMarks(table.array(tableMarkField), selectedMarks);
        selectLegends(legends, selected);
    }
}

export function selectPoint(state, target) {
    if (target[RoleProperty] === MarkRole) {
        return generatePredicates(tableIndexField, target, SELECT_TYPE.POINT);
    } else if (target[RoleProperty] === LegendRole) {
        return generatePredicates(Object.keys(target[DataAttr])[0], target[DataAttr], SELECT_TYPE.POINT);
    } else {
        selectAllMarks(state.svgMarks);
        state.legends.forEach(d => selectAllMarks(d.marks.map(e => e.mark)));
        return null;
    }
}

// function getLegendFields(state, mark) {
//     const legend = mark.legend;

//     if (legend.type === CategoricalColorLegend) {
//         const val = legend.scale.domain()[legend.scale.range().indexOf(window.getComputedStyle(mark)[legend.matchingAttr])];
//         var condition = [val];
//     } else {
//         const val = legend.scale.invert(mark._getBBox().width);
//         var condition = [val, val];
//     }

//     const candidateMarks = state.svgMarks.filter(function(d) {
//         const data = d.__inferred__data__[legend.title.innerHTML];
//         return typeof condition[0] === 'string' ? condition.includes(data) : data >= condition[0] && data <= condition[1];
//     });

//     selectMarks(legend.marks.map(d => d.mark), [mark]);
//     selectMarks(state.svgMarks, candidateMarks);
// }
