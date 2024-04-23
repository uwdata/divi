/* eslint-disable no-undef */
import { TEST_MARK, TEST_X_AXIS_LABEL, TEST_X_AXIS_TICK, TEST_X_AXIS_TITLE, TEST_Y_AXIS_LABEL, TEST_Y_AXIS_TICK, TEST_Y_AXIS_TITLE } from '../../../test/util/test-constants.js';

export async function createScatterPlot() {
    // set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 40, left: 50 };
    const width = 720 - margin.left - margin.right;
    const height = 720 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    let svg = d3.create('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('id', 'chart');

    const r = svg;
    svg = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Read the data
    const data = await d3.csv('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv');

    // Add X axis
    const x = d3.scaleLinear()
        .domain([4 * 0.95, 8 * 1.001])
        .range([0, width]);

    const xAxis = svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x).tickSize(-height * 1.3).ticks(10));

    // x-axis annotations
    xAxis.selectAll('text').classed(TEST_X_AXIS_LABEL, true);
    xAxis.selectAll('line').classed(TEST_X_AXIS_TICK, true);
    xAxis.select('.domain').remove();

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([-0.001, 9 * 1.01])
        .range([height, 0])
        .nice();

    const yAxis = svg.append('g')
        .call(d3.axisLeft(y).tickSize(-width * 1.3).ticks(7));

    // y-axis annotations
    yAxis.selectAll('text').classed(TEST_Y_AXIS_LABEL, true);
    yAxis.selectAll('line').classed(TEST_Y_AXIS_TICK, true);
    yAxis.select('.domain').remove();

    // Customization
    svg.selectAll('.tick line').attr('stroke', 'black').attr('opacity', 0.3);

    // Add X axis label:
    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('x', width / 2 + margin.left)
        .attr('y', height + margin.top + 20)
        .text('Sepal Length')
        .classed(TEST_X_AXIS_TITLE, true); // x-axis title annotation

    // Y axis label:
    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -margin.top - height / 2 + 20)
        .text('Petal Length')
        .classed(TEST_Y_AXIS_TITLE, true); // y-axis title annotation

    // Color scale: give me a specie name, I return a color
    const color = d3.scaleOrdinal()
        .domain(['setosa', 'versicolor', 'virginica'])
        .range(['#F8766D', '#00BA38', '#619CFF']);

    // Add dots
    svg.append('g')
        .selectAll('dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', function(d) { return x(d.Sepal_Length); })
        .attr('cy', function(d) { return y(d.Petal_Length); })
        .attr('r', 5)
        .style('fill', function(d) { return color(d.Species); })
        .classed(TEST_MARK, true); // Mark annotations

    return r.node();
}
