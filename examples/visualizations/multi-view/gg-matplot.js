async function createGgMatplot() {
    let svg1 = await fetch('/examples/visualizations/ggplot2/weather-scatter2.svg');
    svg1 = await svg1.text();

    let svg2 = await fetch('/examples/visualizations/matplotlib/bars1.svg');
    svg2 = await svg2.text();

    let svg3 = await fetch('/examples/visualizations/matplotlib/bars2.svg');
    svg3 = await svg3.text();

    document.querySelector("#chart1").innerHTML = svg1;
    document.querySelector("#chart1 svg").id = "chart1";

    document.querySelector("#chart2").innerHTML = svg2;
    document.querySelector("#chart2 svg").id = "chart2";

    document.querySelector("#chart3").innerHTML = svg3;
    document.querySelector("#chart3 svg").id = "chart3";

    divi.hydrate(['#chart1', '#chart2', '#chart3']);
}
