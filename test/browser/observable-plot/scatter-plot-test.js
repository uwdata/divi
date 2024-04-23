import { hydrate } from '../../../dist/divi.mjs';
import { select } from '../../../node_modules/d3-selection/src/index.js';
import { createScatterPlot } from '../../../examples/annotated-visualizations/observable-plot/annotated-scatter-plot.js';
import { testChartMetadata } from '../../util/test-functions.js';

describe('Observable Plot Scatter Plot', function() {
    const divi = { };
    let root;

    before(async function() {
        const chart = await createScatterPlot();
        root = select('#root').append('div');
        root.node().appendChild(chart);

        divi.groundMetadatas = [{
            chart,
            xAxis: {
                domain: [180, 230],
                ordinal: [],
                tickValues: [180, 190, 200, 210, 220, 230]
            },
            yAxis: {
                domain: [3000, 6000],
                ordinal: [],
                tickValues: [3000, 3500, 4000, 4500, 5000, 5500, 6000]
            }
        }];
        divi.metadatas = await hydrate(chart);
    });

    describe('Chart Metadata', function() { testChartMetadata(divi); });

    after(function() {
        root.remove();
    });
});
