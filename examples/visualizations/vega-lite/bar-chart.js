function createBarChart() {
    const spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "title": "Seattle Weather, 2012-2015",
        "data": {
          "url": "https://vega.github.io/vega-datasets/data/seattle-weather.csv"
        },
        "encoding": {
            "color": {
                "field": "weather",
                "scale": {
                "domain": ["sun", "fog", "drizzle", "rain", "snow"],
                "range": ["#e7ba52", "#a7a7a7", "#aec7e8", "#1f77b4", "#9467bd"]
                }
                },
            "x": {"aggregate": "count"},
            "y": {"title": "Weather", "field": "weather"}
        },
        "width": 800,
        "mark": "bar"
      }
    var view = new vega.View(vega.parse(vegaLite.compile(spec).spec), { renderer: 'svg' });
    view.toSVG().then(function(svg) {
      document.querySelector("#container").innerHTML = svg;
      document.querySelector("#container svg").id = "chart";
      divi.hydrate("#chart");
    });
  }
  