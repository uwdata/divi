import { hydrate } from '../../../dist/divi.mjs';
import { select } from '../../../node_modules/d3-selection/src/index.js';
import { createVegaMultiView } from '../../../examples/annotated-visualizations/multi-view/annotated-vega-lite-weather.js';
import { testChartMetadata } from '../../util/core-structure-test-functions.js';

const groundMetadatas = [
    {
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
    },
    {
        xAxis: 'test'
    }
];

export function testVegaLiteMultiView() {
    const divi = { };
    let root;

    before(async function() {
        const charts = await createVegaMultiView();
        root = select('#root').append('div');
        charts.forEach(c => root.node().appendChild(c));

        divi.metadatas = await hydrate(charts);
        divi.groundMetadatas = groundMetadatas.map((m, i) => { return { ...m, chart: charts[i] }; });
    });

    describe('Chart Metadata', function() { testChartMetadata(divi); });

    after(function() {
        // root.remove();
    });
}
