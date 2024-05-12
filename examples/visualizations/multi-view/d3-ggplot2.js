async function createGgplot2D3() {
    let svg1 = await fetch('/examples/visualizations/ggplot2/stock-multiline.svg');
    svg1 = await svg1.text();

    document.querySelector("#chart1").innerHTML = svg1;
    document.querySelector("#chart1 svg").id = "chart1";

    divi.hydrate(['#chart1']);
}
