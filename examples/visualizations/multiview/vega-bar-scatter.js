async function createVegaBarScatter() {
    const spec1 = {
        "data": {"url": "https://vega.github.io/vega-datasets/data/cars.json"},
        "mark": "bar",
        "encoding": {
        "y": {"field": "Horsepower", "bin": true},
        "x": {"aggregate": "sum", "field": "Acceleration"},
        // "color": {"field": "Origin", "legend": null},
        },
        width: 200,
        height: 200
    };

    const spec2 = {
        "data": {"url": "https://vega.github.io/vega-datasets/data/cars.json"},
        "mark": "bar",
        "encoding": {
        "y": {"field": "Miles_per_Gallon", "bin": true},
        "x": {"aggregate": "max", "field": "Horsepower"},
        // "color": {"field": "Origin", "legend": null}
        },
        width: 200,
        height: 200
  };

  const spec3 = {
    "data": {"url": "https://vega.github.io/vega-datasets/data/cars.json"},
        "mark": "bar",
        "encoding": {
        "y": {"field": "Acceleration", "bin": true},
        "x": {"aggregate": "count"},
        // "color": {"field": "Origin"},
        },
        width: 200,
        height: 200
};

  const spec4 = {
    "data": {"url": "https://vega.github.io/vega-datasets/data/cars.json"},
    "mark": "bar",
    "encoding": {
    "y": {"field": "Displacement", "bin": true},
    "x": {"aggregate": "count"},
    // "color": {"field": "Origin", "legend": null},
    },
    width: 200,
    height: 200
};

const spec5 = {
    "data": {"url": "https://vega.github.io/vega-datasets/data/cars.json"},
    "mark": "point",
    "encoding": {
    "x": {"field": "Acceleration", "type": "quantitative"},
    "y": {"field": "Displacement", "type": "quantitative"},
    // "size": {"field": "Horsepower", "type": "quantitative"},
    },
    width: 400,
    height: 400
};

    var view1 = new vega.View(vega.parse(vegaLite.compile(spec1).spec), { renderer: 'svg' });
    var view2 = new vega.View(vega.parse(vegaLite.compile(spec2).spec), { renderer: 'svg' });
    var view3 = new vega.View(vega.parse(vegaLite.compile(spec3).spec), { renderer: 'svg' });
    var view4 = new vega.View(vega.parse(vegaLite.compile(spec4).spec), { renderer: 'svg' });
    var view5 = new vega.View(vega.parse(vegaLite.compile(spec5).spec), { renderer: 'svg' });

    var svg1 = await view1.toSVG();
    var svg2 = await view2.toSVG();
    var svg3 = await view3.toSVG();
    var svg4 = await view4.toSVG();
    var svg5 = await view5.toSVG();

    document.querySelector("#chart1").innerHTML = svg1;
    document.querySelector("#chart1 svg").id = "chart1";

    // document.querySelector("#chart2").innerHTML = svg2;
    // document.querySelector("#chart2 svg").id = "chart2";

    // document.querySelector("#chart3").innerHTML = svg3;
    // document.querySelector("#chart3 svg").id = "chart3";

    document.querySelector("#chart4").innerHTML = svg4;
    document.querySelector("#chart4 svg").id = "chart4";

    // document.querySelector("#chart5").innerHTML = svg5;
    // document.querySelector("#chart5 svg").id = "chart5";
        
    divi.hydrate(["#chart1 svg","#chart4 svg"], 
    { url: "https://vega.github.io/vega-datasets/data/cars.json" });
}
  