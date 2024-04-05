import assert from 'node:assert';
import { AGGREGATIONS, exportedForTesting } from '../../src/orchestration/link.js';
// import { hydrate } from '../src/index.js';
// import { select } from 'd3-selection';

const { getSubset } = exportedForTesting;

process.on('unhandledRejection', function(err) {
    console.log(err);
    process.exit(1);
});

describe('Array', async function() {
    process.env['NODE_ENV'] = 'test';
    // const svg = create('svg');
    // svg.append('g').append('rect').attr('x', 0).attr('y', 0).attr('width', 100).attr('height', 100);
    // const divi = await hydrate(null);
    // const { xAxis } = divi;
    // const { xDomain } = xAxis;
    // console.log(svg.node().getBBox);

    describe('#indexOf()', function() {
        it('should return -1 when the value is not present!', function() {
            console.log(AGGREGATIONS.COUNT);
            console.log(getSubset([1, 2, 3], [0, 1, 2],[2, 2, 4]));
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });
});
