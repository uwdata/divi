function createStackedChart() {
  // // set the dimensions and margins of the graph
  // var margin = {top: 20, right: 30, bottom: 30, left: 55},
  //     width = 460 - margin.left - margin.right,
  //     height = 400 - margin.top - margin.bottom;
  let margin = {top: 10, right: 30, bottom: 40, left: 50},
      width = 720 - margin.left - margin.right,
      height = 720 - margin.top - margin.bottom

  // append the svg object to the body of the page
  let svg = d3.select("#container")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "chart")
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // Parse the Data
  d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered_wide.csv").then(function(data) {

    // List of groups = header of the csv files
    let keys = data.columns.slice(1)

    // Add X axis
    let x = d3.scaleLinear()
      .domain(d3.extent(data, function(d) { return d.year; }))
      .range([ 0, width ]);
      svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(5));

    // Add Y axis
    let y = d3.scaleLinear()
      .domain([0, 200000])
      .range([ height, 0 ]);
      svg.append("g")
      .call(d3.axisLeft(y));

    // color palette
    let color = d3.scaleOrdinal()
      .domain(keys)
      .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf'])

    //stack the data?
    let stackedData = d3.stack()
      .keys(keys)
      (data)
      //console.log("This is the stack result: ", stackedData)

    // Show the areas
    svg
    .append("g")
      .selectAll("mylayers")
      .data(stackedData)
      .enter()
      .append("path")
        .style("fill", function(d) { return color(d.key); })
        .attr("d", d3.area()
          .x(function(d, i) { return x(d.data.year); })
          .y0(function(d) { return y(d[0]); })
          .y1(function(d) { return y(d[1]); })
      )

      divi.hydrate("#chart");
  })
}
