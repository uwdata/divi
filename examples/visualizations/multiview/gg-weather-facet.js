async function createGgFacet() {
    let svg1 = await fetch('/examples/visualizations/ggplot2/weather-scatter3.svg');
    svg1 = await svg1.text();

    let svg2 = await fetch('/examples/visualizations/ggplot2/weather-scatter4.svg');
    svg2 = await svg2.text();

    document.querySelector("#chart1").innerHTML = svg1;
    document.querySelector("#chart1 svg").id = "chart1";

    document.querySelector("#chart2").innerHTML = svg2;
    document.querySelector("#chart2 svg").id = "chart2";

    divi.hydrate(['#chart1', '#chart2']);
}
