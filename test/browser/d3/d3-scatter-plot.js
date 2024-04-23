import { hydrate } from '../../../dist/divi.mjs';
import { select } from '../../../node_modules/d3-selection/src/index.js';
import { createScatterPlot } from '../../../examples/annotated-visualizations/d3/annotated-scatter-plot.js';
import { testChartMetadata } from '../../util/test-functions.js';

describe('D3 Scatter Plot', function() {
    const divi = { };
    let root;

    before(async function() {
        const chart = (await createScatterPlot()).node();
        root = select('#root').append('div');
        root.node().appendChild(chart);

        divi.groundMetadatas = [{
            chart,
            xAxis: {
                domain: [4, 8],
                ordinal: [],
                tickValues: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8]
            },
            yAxis: {
                domain: [0, 10],
                ordinal: [],
                tickValues: [0, 2, 4, 6, 8, 10]
            }
        }];
        divi.metadatas = await hydrate(chart);
    });

    describe('Chart Metadata', function() { testChartMetadata(divi); });

    after(function() {
        root.remove();
    });
});
