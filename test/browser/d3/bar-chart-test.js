import { hydrate } from '../../../dist/divi.mjs';
import { select } from '../../../node_modules/d3-selection/src/index.js';
import { createBarChart } from '../../../examples/annotated-visualizations/d3/annotated-bar-chart.js';
import { testChartMetadata } from '../../util/test-functions.js';

const groundMetadatas = {
    xAxis: {
        domain: [null, null],
        ordinal: ['United States', 'Russia', 'France', 'Germany (FRG)', 'Israel',
            'United Kingdom', 'Netherlands', 'China', 'Spain', 'Italy'],
        tickValues: ['United States', 'Russia', 'France', 'Germany (FRG)', 'Israel',
            'United Kingdom', 'Netherlands', 'China', 'Spain', 'Italy']
    },
    yAxis: {
        domain: [0, 13000],
        ordinal: [],
        tickValues: [0, 1000, 2000, 3000, 4000, 5000, 6000,
            7000, 8000, 9000, 10000, 11000, 12000, 13000]
    }
};

export function testBarChart() {
    const divi = { };
    let root;

    before(async function() {
        const chart = await createBarChart();
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
