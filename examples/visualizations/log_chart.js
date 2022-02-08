function createLogChart() {
    var superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹",
    formatPower = function(d) { return (d + "").split("").map(function(c) { return superscript[c]; }).join(""); };

    var margin = {top: 40.5, right: 40.5, bottom: 50.5, left: 60.5},
        width = 720 - margin.left - margin.right,
        height = 720 - margin.top - margin.bottom;

    var x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);

    var y = d3.scaleLog()
        .base(Math.E)
        .domain([Math.exp(0), Math.exp(9)])
        .range([height, 0]);

    var xAxis = d3.axisBottom()
        .scale(x);

    var yAxis = d3.axisLeft()
        .scale(y)
        .tickFormat(function(d) { return "e" + formatPower(Math.round(Math.log(d))); });

    var line = d3.line()
        .x(function(d) { return x(d[0]); })
        .y(function(d) { return y(d[1]); });

    var svg = d3.select("#log").append("svg")
        .attr("id", "logchart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(-10,0)")
        .call(yAxis);

    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + (height + 10) + ")")
        .call(xAxis);

    svg.append("path")
        .datum(d3.range(100).map(function(x) { return [x, x * x + x + 1]; }))
        .attr("class", "line")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("strokewidth", "1.5px");

    AutomaticInteraction.hydrate("#logchart", "#control");
}
