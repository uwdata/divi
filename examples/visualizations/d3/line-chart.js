function createLineChart() {
  // set the dimensions and margins of the graph
  // var margin = {top: 10, right: 30, bottom: 30, left: 60},
  //     width = 460 - margin.left - margin.right,
  //     height = 400 - margin.top - margin.bottom;
  var margin = {top: 10, right: 30, bottom: 40, left: 50},
      width = 720 - margin.left - margin.right,
      height = 720 - margin.top - margin.bottom

  // append the svg object to the body of the page
  var svg_line = d3.select("#container")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "chart")
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  //Read the data
  d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv").then(function(data) {

  //   // When reading the csv, I must format variables:
  //   function(d){
  //     return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
  //   }
  data = data.map(function(d) {
      return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
  });

      // Add X axis --> it is a date format
      var x = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([ 0, width ]);
        svg_line.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.value; })])
        .range([ height, 0 ]);
        svg_line.append("g")
        .call(d3.axisLeft(y));

      // Add the line
      svg_line.append("g").append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function(d) { return x(d.date) })
          .y(function(d) { return y(d.value) })
          )

      divi.hydrate("#chart");
  })
}
