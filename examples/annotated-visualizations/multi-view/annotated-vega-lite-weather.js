/* eslint-disable no-undef */
export async function createVegaMultiView() {
    const spec1 = {
        $schema: '/examples/data/vega-lite-schema-v5.json',
        title: 'Seattle Weather, 2012-2015',
        data: {
            url: '/examples/data/seattle-weather.csv'
        },
        encoding: {
            color: {
                title: 'Weather',
                field: 'weather',
                type: 'nominal',
                scale: {
                    domain: ['sun', 'fog', 'drizzle', 'rain', 'snow'],
                    range: ['#e7ba52', '#a7a7a7', '#aec7e8', '#1f77b4', '#9467bd']
                }
            },
            size: {
                title: 'Precipitation',
                field: 'precipitation',
                scale: { type: 'linear', domain: [-1, 50] },
                type: 'quantitative'
            },
            x: {
                field: 'date',
                timeUnit: 'utcyearmonthdate',
                title: 'Date',
                axis: { format: '%b %Y' }
            },
            y: {
                title: 'Maximum Daily Temperature (C)',
                field: 'temp_max',
                scale: { domain: [-5, 40] },
                type: 'quantitative'
            }
        },
        width: 700,
        height: 400,
        mark: 'point'
    };

    const spec2 = {
        $schema: '/examples/data/vega-lite-schema-v5.json',
        title: 'Seattle Weather, 2012-2015',
        data: {
            url: '/examples/data/seattle-weather.csv'
        },
        encoding: {
            color: {
                field: 'weather',
                scale: {
                    domain: ['sun', 'fog', 'drizzle', 'rain', 'snow'],
                    range: ['#e7ba52', '#a7a7a7', '#aec7e8', '#1f77b4', '#9467bd']
                }
            },
            x: { aggregate: 'max', field: 'wind' },
            y: { title: 'Weather', field: 'weather' }
        },
        width: 700,
        mark: 'bar'
    };

    const view1 = new vega.View(vega.parse(vegaLite.compile(spec1).spec), { renderer: 'svg' });
    const view2 = new vega.View(vega.parse(vegaLite.compile(spec2).spec), { renderer: 'svg' });

    const svgText1 = await view1.toSVG();
    const svgText2 = await view2.toSVG();

    const svg1 = d3.create('div').html(svgText1).select('svg').node();
    const svg2 = d3.create('div').html(svgText2).select('svg').node();

    return [svg1, svg2];
}
