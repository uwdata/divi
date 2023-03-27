async function getPlot(id) {
    let data = await d3.json('https://vega.github.io/vega-datasets/data/cars.json', d3.autoType);
    // const origins = [...new Set(data.map(d => d.Origin))];
    // const incomes = [31,133, 42,000, 17,390];

    // data = [
    //     {Origin: origins[0], Income: incomes[0]},
    //     {Origin: origins[1], Income: incomes[1]},
    //     {Origin: origins[2], Income: incomes[2]}
    // ];
    const p = Plot.plot({
        width: 400,
        height: 400,
        x: {
            grid: true
        },
        y: {
            grid: true
        },
        marks: [
          Plot.dot(data, {x: "Weight_in_lbs", y: "Acceleration"})
        ]
    });
    
    return p;
}

async function createVegaDualLinking() {
    const spec1 = {
        "data": {"url": "https://vega.github.io/vega-datasets/data/cars.json"},
        "mark": "bar",
        "encoding": {
        "y": {"field": "Horsepower", "bin": true},
        "x": {"aggregate": "sum", "field": "Acceleration"},
        },
        width: 300,
        height: 300
    };

  const spec2 = {
    "data": {"url": "https://vega.github.io/vega-datasets/data/cars.json"},
        "mark": "bar",
        "encoding": {
        "y": {"field": "Acceleration", "bin": true},
        "x": {"aggregate": "count"},
        },
        width: 300,
        height: 300
    };

    const spec3 = {
        "data": {"url": "https://vega.github.io/vega-datasets/data/cars.json"},
        "mark": "point",
        "encoding": {
        "x": {"field": "Horsepower", "type": "quantitative"},
        "y": {"field": "Displacement", "type": "quantitative"},
        // "size": {"field": "Horsepower", "type": "quantitative"},
        },
        width: 400,
        height: 400
    };

    var view1 = new vega.View(vega.parse(vegaLite.compile(spec1).spec), { renderer: 'svg' });
    var view2 = new vega.View(vega.parse(vegaLite.compile(spec2).spec), { renderer: 'svg' });
    var view3 = new vega.View(vega.parse(vegaLite.compile(spec3).spec), { renderer: 'svg' });

    var svg1 = await view1.toSVG();
    var svg2 = await view2.toSVG();
    var svg3 = await view3.toSVG();
    var svg4 = await getPlot('chart4');
    
    document.querySelector("#chart1").innerHTML = svg1;
    document.querySelector("#chart1 svg").id = "chart1";

    document.querySelector("#chart2").innerHTML = svg2;
    document.querySelector("#chart2 svg").id = "chart2";

    document.querySelector("#chart3").innerHTML = svg3;
    document.querySelector("#chart3 svg").id = "chart3";

    d3.select("#chart4").node().append(svg4);
    d3.select("#chart4 svg").node().id = "chart4";
        
    AutomaticInteraction.hydrate([ "#chart1 svg", "#chart2 svg", "#chart3 svg", "#chart4 svg"], 
    { url: "https://vega.github.io/vega-datasets/data/cars.json" });
}
  