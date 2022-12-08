function plot(title, xLabel, yLabel, yTicks, vals) {
    var selectText = function() { 
      const c = this.className.baseVal;
      selectClasses(c); 
    };
    
    var SVG = d3.select('#plot').append('svg');
    var margin = {top: 10, right: 185, bottom: 30, left: 60},
      width = 600 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;
  
    svg = SVG.attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
  
    var X = [500, 1000, 2000, 5000, 10000, 20000];
    var names = ['D3', 'Protovis', 'Flash'];
    var colors = ['purple', 'navy', 'brown'];
    
     var x = d3.scaleLinear()
        .domain(d3.extent(X))
        .range([ 0, width ]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickValues([500, 5000, 10000, 20000]).tickFormat(d => d));
  
      // Add Y axis
      var y = d3.scaleLinear()
        .domain(d3.extent(yTicks).map(d => d * 1.2))
        .range([ height, 0 ]);
      svg.append("g")
        .call(d3.axisLeft(y).tickSize(-width).tickValues(yTicks))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll("line").style("opacity", "0.25"));
  
      // Add the line
      svg.selectAll(".path")
        .data(d3.range(3))
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", i => colors[i])
        .attr("stroke-width", 3)
        .attr("class", i => names[i].toLowerCase())
        .attr("d", 
          function(i) {
            return d3.line()
              .x(function(j) { return x(X[j]) })
              .y(function(j) { return y(vals[i][j]) })
              (d3.range(X.length))
          }
        )
  
    svg.append("text")
          .attr("x", (width / 2))             
          .attr("y", 0 + (margin.top))
          .attr("text-anchor", "middle")  
          .style("font-size", "16px") 
          .attr("font-weight", 700)
          .attr("class", title === "Stacked Graph" ? "sg" : "sm")
          .style("cursor", "pointer")
          .on("click", selectText)
          .text(title);
  
    // svg.append("text")
    //   .attr("text-anchor", "end")
    //   .attr("y", -margin.left / 2 - 10)
    //   .attr("x", -height / 4)
    //   .attr("dy", ".75em")
    //   .attr("class", xLabel === "Frame Rate (fps)" ? "fps" : "time")
    //   .style("font-size", "12px")
    //   .attr("transform", "rotate(-90)")
    //   .style("cursor", "pointer")
    //   .on("click", selectText)
    //   .text(xLabel);
  
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("y", height + margin.top + 10)
      .attr("x", width / 2 + margin.left)
      .attr("dy", ".75em")
      .attr("class", "dp")
      .style("font-size", "12px")
      .style("cursor", "pointer")
      .on("click", selectText)
      .text(yLabel);
  
    svg.selectAll(".text")
      .data(names)
      .enter()
      .append("text")
      .attr("y", d => y(vals[names.indexOf(d)][5]) - 5)
      .attr("x", width + 5)
      .attr("dy", ".75em")
      .attr("class", d => d.toLowerCase())
      .style("font-size", "12px")
      .style("cursor", "pointer")
      .on("click", selectText)
      .text(d => d);
  
      return SVG.node();
}