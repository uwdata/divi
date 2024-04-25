import { todo } from '../../util/helper-functions.js';
import { testLineChart } from './line-chart-test.js';

describe('ggplot2', function() {
    describe('Line chart - plant species', testLineChart);
    describe.skip('Scatter plot w/ trendline', todo);
    describe.skip('Line chart - stocks', todo);
});
