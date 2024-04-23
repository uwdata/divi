import assert from 'node:assert';
import { flattenRGB } from '../../src/util/util.js';

process.on('unhandledRejection', function(err) {
    console.log(err);
    process.exit(1);
});

describe('Util', async function() {
    describe('#flattenRGB()', function() {
        it('should flatten without error', function() {
            assert.strictEqual(flattenRGB('rgb(255, 210, 130)'), (255 + 210 + 130));
        });
    });
});
