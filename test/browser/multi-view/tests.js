import { todo } from '../../util/helper-functions.js';
import { testVegaLiteMultiView } from './vega-lite-weather-test.js';

describe('Multi-view', function() {
    describe('Vega-Lite - weather', testVegaLiteMultiView);
    describe.skip('Vega-Lite + Observable Plot - cars', todo);
    describe.skip('Vega-Lite crossfiltering - cars', todo);
    describe.skip('Vega-Lite crossfiltering - flights', todo);
    describe.skip('Vega-Lite + Matplotlib - weather', todo);
    describe.skip('Vega-Lite + ggplot2 - weather', todo);
    describe.skip('ggplot2 + Matplotlib - weather', todo);
    describe.skip('ggplot2 facets - weather', todo);
    describe.skip('Observable plot facets - cars', todo);
    describe.skip('Excel + Matplotlib + ggplot2 - weather', todo);
});
