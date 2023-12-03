function createLineChart() {
    const spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Stock prices of 5 Tech Companies over Time.",
        "data": {"url": "https://vega.github.io/vega-datasets/data/stocks.csv"},
        "mark": "line",
        "height": 450,
        "width": 450,
        "encoding": {
            "x": {"field": "date", "type": "temporal"},
            "y": {"field": "price", "type": "quantitative"},
            "color": {"field": "symbol", "type": "nominal"}
        }
    }
  
    var view = new vega.View(vega.parse(vegaLite.compile(spec).spec), { renderer: 'svg' });
    view.toSVG().then(function(svg) {
      document.querySelector("#container1").innerHTML = svg;
      document.querySelector("#container1 svg").id = "chart";
    //   divi.hydrate("#chart");
    });
  }
  