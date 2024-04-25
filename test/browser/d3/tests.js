import { todo } from '../../util/helper-functions.js';
import { testBarChart } from './bar-chart-test.js';
import { testScatterPlot } from './scatter-plot-test.js';

describe('D3', function() {
    describe('Scatter plot', testScatterPlot);
    describe.skip('Line chart', todo);
    describe.skip('Stacked area chart', todo);
    describe.skip('Stacked bar chart', todo);
    describe('Bar chart', testBarChart);
    describe.skip('Log chart', todo);
    describe.skip('Hex map', todo);
    describe.skip('US population map', todo);
});
