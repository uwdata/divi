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
    // var view = new vega.View(spec)
    // .logLevel(vega.Warn) // set view logging level
    // .renderer('svg')     // set render type (defaults to 'canvas')
    // .initialize('#view') // set parent DOM element
    // .hover(); 
  
    vegaEmbed('#vegamultiview1', spec1, {renderer: 'svg'}).then(function() {
        // vegaEmbed('#vegamultiview2', spec2, {renderer: 'svg'}).then(function() {
            const svg1 = document.querySelector('#vegamultiview1 svg');
            // const svg2 = document.querySelector('#vegamultiview2 svg');
            AutomaticInteraction.hydrate(svg1);
        // });
    });

    // var view = new vega.View(vega.parse(spec1), { loader: vega.loader(),
    //     logLevel: vega.Warn, renderer: 'none' }).initialize().finalize();
    // view.toSVG().then(function(svg) {
    // console.log(svg);
    //   document.querySelector("#vegamultiview1").innerHTML = svg;
    //   document.querySelector("#vegamultiview1 svg").id =  "vegachart";
    // //   AutomaticInteraction.hydrate("#vegachart");
    // });
  
    // vegaEmbed("#vega", spec, {renderer: "svg"}).then(function(result) {
    //   result.view.toSVG().then(function(svg) {
    //     document.querySelector("#vega").innerHTML = svg;
    //     document.querySelector("#vega svg").id = "vegachart";
    //     AutomaticInteraction.hydrate("#vegachart", "#control");
    //   });
    // });
  }
  