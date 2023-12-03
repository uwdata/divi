async function createGgplot2VegaLite() {
    const spec1 = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "title": "Seattle Weather, 2012-2015",
        "data": {
          "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv"
        },
        "encoding": {
            "color": {
                "title": "Weather",
                "field": "weather",
                "type": "nominal",
                "scale": {
                "domain": ["sun", "fog", "drizzle", "rain", "snow"],
                "range": ["#e7ba52", "#a7a7a7", "#aec7e8", "#1f77b4", "#9467bd"]
                }
            },
            "size": {
            "title": "Precipitation",
            "field": "precipitation",
            "scale": {"type": "linear", "domain": [-1, 50]},
            "type": "quantitative"
            },
            "x": {
            "field": "date",
            "timeUnit": "utcyearmonthdate",
            "title": "Date",
            "axis": {"format": "%b %Y"}
            },
            "y": {
            "title": "Maximum Daily Temperature (C)",
            "field": "temp_max",
            "scale": {"domain": [-5, 40]},
            "type": "quantitative"
            }
        },
        "width": 700,
        "height": 400,
        "mark": "point"
    }

    let view1 = new vega.View(vega.parse(vegaLite.compile(spec1).spec), { renderer: 'svg' });
    let svg1 = await view1.toSVG();

    let svg2 = await fetch('/examples/visualizations/ggplot2/weather-scatter.svg');
    svg2 = await svg2.text();

    document.querySelector("#chart1").innerHTML = svg1;
    document.querySelector("#chart1 svg").id = "chart1";

    document.querySelector("#chart2").innerHTML = svg2;
    document.querySelector("#chart2 svg").id = "chart2";

    divi.hydrate(['#chart1 svg', '#chart2 svg']);
}
