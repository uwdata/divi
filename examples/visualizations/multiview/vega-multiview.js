function createVegaMultiView() {
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
            "scale": {"domain": [-1, 50]},
            "type": "quantitative"
            },
            "x": {
            "field": "date",
            "timeUnit": "monthdate",
            "title": "Date",
            "axis": {"format": "%b"}
            },
            "y": {
            "title": "Maximum Daily Temperature (C)",
            "field": "temp_max",
            "scale": {"domain": [-5, 40]},
            "type": "quantitative"
            }
        },
        "width": 600,
        "height": 300,
        "mark": "point"
        }

    const spec2 = {
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
        "width": 600,
        "mark": "bar"
      }
  
    var view1 = new vega.View(vega.parse(vegaLite.compile(spec1).spec), { renderer: 'svg' });
    var view2 = new vega.View(vega.parse(vegaLite.compile(spec2).spec), { renderer: 'svg' });
    view1.toSVG().then(function(svg1) {
        view2.toSVG().then(function(svg2) {
            document.querySelector("#chart1").innerHTML = svg1;
            document.querySelector("#chart1 svg").id = "chart1";
            document.querySelector("#chart2").innerHTML = svg2;
            document.querySelector("#chart2 svg").id = "chart2";
            AutomaticInteraction.hydrate([svg1, svg2]);
        })
    });
  }
  