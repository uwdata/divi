async function createBarChart() {
    let data = await d3.csv('https://raw.githubusercontent.com/observablehq/plot/main/test/data/alphabet.csv', d3.autoType);

    const p = Plot.plot({
        width: 640,
        height: 400,
        y: {
            grid: true
        },
        marks: [
          Plot.barY(data, {x: "letter", y: "frequency"})
        ]
    });
   
    d3.select(p).attr('id', 'chart1');
    d3.select('#container').node().append(p);
    divi.hydrate("#chart1");
}
