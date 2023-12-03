function createLogChart() {
    var superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹",
    formatPower = function(d) { return (d + "").split("").map(function(c) { return superscript[c]; }).join(""); };

    var margin = {top: 40.5, right: 40.5, bottom: 50.5, left: 60.5},
        width = 720 - margin.left - margin.right,
        height = 720 - margin.top - margin.bottom;

    // var x = d3.scaleLinear()
    //     .domain([0, 100])
    //     .range([0, width]);

    // var y = d3.scaleLog()
    //     .base(Math.E)
    //     .domain([Math.exp(0), Math.exp(9)])
    //     .range([height, 0]);

    let data = d3.range(10).map(function(x) { return [Math.exp(x), x * Math.exp(2.5)]; });
 
    var x = d3.scaleLog()
        // .base(Math.E)
        .domain([Math.exp(0), Math.exp(9)])
        .range([0, width]);

    var y = d3.scaleLinear()
        .domain(d3.extent(data.map(d => d[1])))
        .range([height, 0]);


    var xAxis = d3.axisBottom()
        .scale(x)
        // .tickFormat(function(d) { return "e" + formatPower(Math.round(Math.log(d))); });

    var yAxis = d3.axisLeft()
        .scale(y);

    var line = d3.line()
        .x(function(d) { return x(d[0]); })
        .y(function(d) { return y(d[1]); });

    var svg = d3.select("#container").append("svg")
        .attr("id", "chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(-10,0)")
        .call(yAxis);

    var gx= svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + (height + 10) + ")")
        .call(xAxis);


    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("strokewidth", "1.5px");

    //     let svg_ = d3.select("svg");

    // svg_.call(d3.zoom().on("zoom", function({transform}) {
    //     console.log('here')
    //     gx.call(xAxis.scale(transform.rescaleX(x)));
    //     x.range([margin.left, width - margin.right]
    //         .map(d => transform.applyX(d)));
    //     svg_.select(".line")
    //       .attr("d", d3.line()
    //         .x(function(d) { return x(d[0]); })
    //         .y(function(d) { return y(d[1]); })
    //       )
    // }));

    divi.hydrate("#chart");
}
