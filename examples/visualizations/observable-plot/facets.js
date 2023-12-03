async function createFacets() {
    let data = await d3.json('https://vega.github.io/vega-datasets/data/cars.json');

    const p1 = Plot.plot({
        width: 300,
        height: 300,
        y: {
            grid: true
        },
        color: {
            legend: false
        },
        marks: [
          Plot.dot(data, {x: "Acceleration", y: "Horsepower", stroke: "Origin"})
        ]
    });

    const p2 = Plot.plot({
        width: 300,
        height: 300,
        y: {
            grid: true
        },
        color: {
            legend: false
        },
        marks: [
          Plot.dot(data, {x: "Acceleration", y: "Displacement", stroke: "Origin"})
        ]
    });
    const p3 = Plot.plot({
        width: 300,
        height: 300,
        y: {
            grid: true
        },
        color: {
            legend: false
        },
        marks: [
          Plot.dot(data, {x: "Weight_in_lbs", y: "Horsepower", stroke: "Origin"})
        ]
    });
    const p4 = Plot.plot({
        width: 300,
        height: 300,
        color: {
            legend: false
        },
        y: {
            grid: true
        },
        marks: [
          Plot.dot(data, {x: "Cylinders", y: "Acceleration", stroke: "Origin"})
        ]
    });
   
    d3.select(p1).attr('id', 'chart1');
    d3.select('#container').node().append(p1);

    d3.select(p2).attr('id', 'chart2');
    d3.select('#container').node().append(p2);
    
    d3.select(p3).attr('id', 'chart3');
    d3.select('#container').node().append(p3);

    d3.select(p4).attr('id', 'chart4');
    d3.select('#container').node().append(p4);

    divi.hydrate(['#chart1', '#chart2', '#chart3', "#chart4"], { url: 'https://vega.github.io/vega-datasets/data/cars.json' });
}
