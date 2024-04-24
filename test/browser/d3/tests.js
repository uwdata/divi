import { testBarChart } from './bar-chart-test.js';
import { testScatterPlot } from './scatter-plot-test.js';

describe('D3', function() {
    describe('Bar chart', testBarChart);
    describe('Scatter plot', testScatterPlot);
});
