async function createGgplot2Setup() {
    let svg1 = await fetch('/examples/visualizations/ggplot2/multi-view-setup/excel-scatter.svg');
    svg1 = await svg1.text();

    let svg2 = await fetch('/examples/visualizations/ggplot2/multi-view-setup/scatter.svg');
    svg2 = await svg2.text();

    let svg3 = await fetch('/examples/visualizations/matplotlib/multi-view-setup/bars_test.svg');
    svg3 = await svg3.text();

    let svg4 = await fetch('/examples/visualizations/matplotlib/multi-view-setup/bars1.svg');
    svg4 = await svg4.text();

    document.querySelector("#chart1").innerHTML = svg1;
    document.querySelector("#chart1 svg").id = "svg1";

    document.querySelector("#chart2").innerHTML = svg2;
    document.querySelector("#chart2 svg").id = "svg2";

    document.querySelector("#chart3").innerHTML = svg3;
    document.querySelector("#chart3 svg").id = "svg3";

    // document.querySelector("#chart4").innerHTML = svg4;
    // document.querySelector("#chart4 svg").id = "svg4";

    divi.hydrate(['#svg1', '#svg2', '#svg3'], {url:'/examples/data/seattle-weather.csv'});
}
