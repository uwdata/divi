/* eslint-disable no-undef */

import { TEST_LEGEND_LABEL, TEST_LEGEND_MARK, TEST_LEGEND_TITLE, TEST_MARK, TEST_X_AXIS_LABEL, TEST_X_AXIS_TICK, TEST_X_AXIS_TITLE, TEST_Y_AXIS_LABEL, TEST_Y_AXIS_TICK, TEST_Y_AXIS_TITLE } from '../../../test/util/test-constants.js';

const baseID = 'svg_c9f6953f-273d-40cc-a962-d74ae6872c72_';

const xAxisTickIDs = [
    'el_7', 'el_8', 'el_9', 'el_16', 'el_17'
];

const xAxisLabelIDs = [
    'el_34', 'el_35'
];

const yAxisTickIDs = [
    'el_2', 'el_3', 'el_4', 'el_5', 'el_6', 'el_10',
    'el_11', 'el_12', 'el_13', 'el_14', 'el_15'
];

const yAxisLabelIDs = [
    'el_28', 'el_29', 'el_30', 'el_31', 'el_32', 'el_33'
];

const markIDs = [
    'el_18', 'el_19', 'el_20', 'el_21', 'el_22', 'el_23',
    'el_24', 'el_25', 'el_26', 'el_27'
];

const legendMarkIDs = [
    'el_39', 'el_40', 'el_41', 'el_42', 'el_43', 'el_44',
    'el_45', 'el_46', 'el_47', 'el_48'
];

const legendLabelIDs = [
    'el_49', 'el_50', 'el_51', 'el_52', 'el_53', 'el_54',
    'el_55', 'el_56', 'el_57', 'el_58'
];

const legendTitleID = 'el_38';
const xAxisTitleID = 'el_36';
const yAxisTitleID = 'el_37';

export async function createLineChart() {
    const response = await fetch('/examples/visualizations/ggplot2/line-chart.svg');
    const text = await response.text();

    // Add annotations
    const svg = d3.create('div').html(text).select('svg');

    // Marks
    for (const id of markIDs) {
        svg.select('#' + baseID + id).classed(TEST_MARK, true);
    }

    // x-axis ticks
    for (const id of xAxisTickIDs) {
        svg.select('#' + baseID + id).classed(TEST_X_AXIS_TICK, true);
    }

    // x-axis labels
    for (const id of xAxisLabelIDs) {
        svg.select('#' + baseID + id).classed(TEST_X_AXIS_LABEL, true);
    }

    // x-axis title
    svg.select('#' + baseID + xAxisTitleID).classed(TEST_X_AXIS_TITLE, true);

    // y-axis ticks
    for (const id of yAxisTickIDs) {
        svg.select('#' + baseID + id).classed(TEST_Y_AXIS_TICK, true);
    }

    // y-axis labels
    for (const id of yAxisLabelIDs) {
        svg.select('#' + baseID + id).classed(TEST_Y_AXIS_LABEL, true);
    }

    // y-axis title
    svg.select('#' + baseID + yAxisTitleID).classed(TEST_Y_AXIS_TITLE, true);

    // Legend marks
    for (const id of legendMarkIDs) {
        svg.select('#' + baseID + id).classed(TEST_LEGEND_MARK, true);
    }

    // Legend labels
    for (const id of legendLabelIDs) {
        svg.select('#' + baseID + id).classed(TEST_LEGEND_LABEL, true);
    }

    // Legend title
    svg.select('#' + baseID + legendTitleID).classed(TEST_LEGEND_TITLE, true);

    return svg.node();
}
