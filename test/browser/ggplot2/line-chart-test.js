import { hydrate } from '../../../dist/divi.mjs';
import { select } from '../../../node_modules/d3-selection/src/index.js';
import { createLineChart } from '../../../examples/annotated-visualizations/ggplot2/annotated-line-chart.js';
import { testChartMetadata } from '../../util/test-functions.js';

const groundMetadatas = {
    xAxis: {
        domain: [new Date(0, 0, 1), new Date(0, 3, 1)],
        ordinal: [],
        tickValues: [new Date(0, 0, 1), new Date(0, 3, 1)]
    },
    yAxis: {
        domain: [-30, 20],
        ordinal: [],
        tickValues: [-30, -20, -10, 0, 10, 20]
    }
};

export function testLineChart() {
    const divi = { };
    let root;

    before(async function() {
        const chart = await createLineChart();
        root = select('#root').append('div');
        root.node().appendChild(chart);

        divi.metadatas = await hydrate(chart);
        divi.groundMetadatas = [{ ...groundMetadatas, chart }];
    });

    describe('Chart Metadata', function() { testChartMetadata(divi); });

    after(function() {
        root.remove();
    });
}
