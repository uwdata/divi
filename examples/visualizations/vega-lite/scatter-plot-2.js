function createScatterPlot() {
    const spec = {
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
            "scale": {"domain": [-1, 50]},
            "type": "quantitative"
            },
            "x": {
            "field": "date",
            "timeUnit": "monthdate",
            "title": "Date",
            "axis": {"format": "%m"}
            },
            "y": {
            "title": "Maximum Daily Temperature (C)",
            "field": "temp_max",
            "scale": {"domain": [-5, 40]},
            "type": "quantitative"
            }
        },
        "width": 800,
        "height": 500,
        "mark": "point"
    }
    var view = new vega.View(vega.parse(vegaLite.compile(spec).spec), { renderer: 'svg' });
    view.toSVG().then(function(svg) {
      document.querySelector("#container").innerHTML = svg;
      document.querySelector("#container svg").id = "chart";
      divi.hydrate("#chart");
    });
  }
  