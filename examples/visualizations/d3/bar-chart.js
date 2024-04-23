/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
async function createBarChart() {
    // set the dimensions and margins of the graph
    const margin = { top: 30, right: 30, bottom: 70, left: 60 };
    const width = 720 - margin.left - margin.right;
    const height = 720 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    let svg = d3.create('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('id', 'chart');

    const r = svg;
    svg = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Parse the Data
    const data = await d3.csv('https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv');

    // sort data
    data.sort(function(b, a) {
        return a.Value - b.Value;
    });

    // X axis
    const x = d3.scaleBand()
        .range([0, width])
        .domain(data.map(function(d) { return d.Country; }))
        .padding(0.2);
    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'translate(-10,0)rotate(-45)')
        .style('text-anchor', 'end');

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 13000])
        .range([height, 0]);
    svg.append('g')
        .call(d3.axisLeft(y));

    // Bars
    svg.selectAll('mybar')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', function(d) { return x(d.Country); })
        .attr('y', function(d) { return y(d.Value); })
        .attr('width', x.bandwidth())
        .attr('height', function(d) { return height - y(d.Value); })
        .attr('fill', '#69b3a2');

    return r.node();
}
