// import { select } from 'd3-selection';
import { hydrate } from '../../../dist/divi.mjs';
import { select } from 'https://cdn.skypack.dev/d3-selection@3';
import { createBarChart } from '../../../examples/visualizations/d3/bar-chart.js';

// const divi = await hydrate(shadowRoot.node());

// const { xAxis } = divi;
// const { xDomain } = xAxis;
describe('Array', function() {
    let divi, shadowRoot;

    before(async function() {
        const chart = (await createBarChart()).node();
        shadowRoot = select('#root').node().attachShadow({ mode: 'closed' });
        shadowRoot.appendChild(chart);
        divi = await hydrate(chart);
    });

    describe('#indexOf()', function() {
        it('should return -1 when the value is not set', function() {
            console.log('hello');
            console.log(divi);
            const arr = [1, 2, 3];
            chai.expect(arr.indexOf(4)).to.equal(-1);
        });
    });

    after(function() {
        shadowRoot.innerHTML = '';
    });
});
