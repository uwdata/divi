/* eslint-disable no-undef */

import { TEST_MARK, TEST_X_AXIS_LABEL, TEST_X_AXIS_TICK, TEST_X_AXIS_TITLE, TEST_Y_AXIS_LABEL, TEST_Y_AXIS_TICK, TEST_Y_AXIS_TITLE } from '../../../test/util/test-constants.js';

export async function createScatterPlot() {
    let data = await d3.csv('/examples/data/penguins.csv', d3.autoType);
    data = data.filter(d => d.sex != null);

    const p = Plot.plot({
        inset: 8,
        grid: true,
        color: {
            legend: false,
            style: { marginLeft: 500 }
        },
        marks: [
            Plot.dot(data, { x: 'flipper_length_mm', y: 'body_mass_g', stroke: 'sex' }),
            Plot.axisY({ label: '↑ body_mass_g', marginLeft: 50 })
        ]
    });

    d3.select(p).attr('id', 'chart1');

    // Add annotations
    const svg = d3.select(p);
    svg.selectAll('circle').classed(TEST_MARK, true); // Marks

    // x-axis ticks
    svg.selectAll('g').filter(function() {
        const attr = d3.select(this).attr('aria-label');
        return attr === 'x-grid' || attr === 'x-axis tick';
    }).selectAll('line, path').classed(TEST_X_AXIS_TICK, true);

    // x-axis labels
    svg.selectAll('g').filter(function() {
        return d3.select(this).attr('aria-label') === 'x-axis tick label';
    }).selectAll('text').classed(TEST_X_AXIS_LABEL, true);

    // x-axis title
    svg.selectAll('g').filter(function() {
        return d3.select(this).attr('aria-label') === 'x-axis label';
    }).select('text').classed(TEST_X_AXIS_TITLE, true);

    // y-axis ticks
    svg.selectAll('g').filter(function() {
        const attr = d3.select(this).attr('aria-label');
        return attr === 'y-grid' || attr === 'y-axis tick';
    }).selectAll('line, path').classed(TEST_Y_AXIS_TICK, true);

    // y-axis labels
    svg.selectAll('g').filter(function() {
        return d3.select(this).attr('aria-label') === 'y-axis tick label';
    }).selectAll('text').classed(TEST_Y_AXIS_LABEL, true);

    // y-axis title
    svg.selectAll('g').filter(function() {
        return d3.select(this).attr('aria-label') === 'y-axis label';
    }).select('text').classed(TEST_Y_AXIS_TITLE, true);

    return p;
}
