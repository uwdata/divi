function createVegaCrossfilter() {
    const spec1 = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {
          "url": "https://vega.github.io/vega-datasets/data/flights-2k.json",
          "format": {"parse": {"date": "date"}}
        },
        "transform": [{"calculate": "hours(datum.date)", "as": "time"}],
        "encoding": {
          "y": {
            "field": "distance",
            "bin": {"maxbins": 20}
          },
          "x": {"aggregate": "count"}
        },
        "mark": "bar",
        width: 200,
        height: 200
    };

    const spec2 = {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "data": {
        "url": "https://vega.github.io/vega-datasets/data/flights-2k.json",
        "format": {"parse": {"date": "date"}}
      },
      "transform": [{"calculate": "hours(datum.date)", "as": "time", "filter": {"field": "origin", 
      "oneOf": ["TUL", "TUS", "LAX", "ABQ", "OKC", "SAN", "LAS"]}}],
      "encoding": {
        "y": {
          "field": "origin", 
        },
        "x": {"aggregate": "stdev", "field": "delay", "scale": {"domain": [0, 70]}}
      },
      "mark": "bar",
      width: 200,
      height: 200
  };

//   const spec3 = {
//     "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
//     "data": {
//       "url": "https://vega.github.io/vega-datasets/data/flights-2k.json",
//       "format": {"parse": {"date": "date"}}
//     },
//     "transform": [{"calculate": "hours(datum.date)", "as": "time"}],
//     "encoding": {
//       "y": {
//         "field": "time",
//         "bin": {"maxbins": 20}
//       },
//       "x": {"aggregate": "count"}
//     },
//     "mark": "bar",
//     width: 400,
//     height: 400
// };

  const spec4 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "data": {
      "url": "https://vega.github.io/vega-datasets/data/flights-2k.json",
      "format": {"parse": {"date": "date"}}
    },
    "encoding": {
      "y": {
        "field": "delay",
        "bin": {"maxbins": 20}
      },
      "x": {"aggregate": "count"}
    },
    "mark": "bar",
    width: 200,
    height: 200
};

const spec5 = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {
    "url": "https://vega.github.io/vega-datasets/data/flights-2k.json",
    "format": {"parse": {"date": "date"}}
  },
  "transform": [{"calculate": "hours(datum.date)", "as": "time", "filter": {"field": "origin", 
        "oneOf": ["TUL", "TUS", "LAX", "ABQ", "OKC", "SAN", "LAS"]}}],
  "encoding": {
    "y": { "title": "Origin", "field": "origin" },
    "x": {"aggregate": "mean", "field": "distance"}
  },
  "mark": "bar",
  width: 200,
  height: 200
};

    var view1 = new vega.View(vega.parse(vegaLite.compile(spec1).spec), { renderer: 'svg' });
    var view2 = new vega.View(vega.parse(vegaLite.compile(spec4).spec), { renderer: 'svg' });
    var view3 = new vega.View(vega.parse(vegaLite.compile(spec2).spec), { renderer: 'svg' });
    view1.toSVG().then(function(svg1) {
      view2.toSVG().then(function(svg2) {
        view3.toSVG().then(function(svg3) {
          document.querySelector("#chart1").innerHTML = svg1;
          document.querySelector("#chart1 svg").id = "chart1";

          document.querySelector("#chart2").innerHTML = svg2;
          document.querySelector("#chart2 svg").id = "chart2";

          document.querySelector("#chart3").innerHTML = svg3;
          document.querySelector("#chart3 svg").id = "chart3";

          divi.hydrate(["#chart1 svg", "#chart2 svg", "#chart3 svg"], { url: "https://vega.github.io/vega-datasets/data/flights-2k.json" });
        })
      })
    });
}
  