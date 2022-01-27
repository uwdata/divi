
export function zoom() {
    function add_zoom_pan() {
        let el = document.getElementById("chart");
        let svg = d3.select("#chart");
        let g = svg.selectAll(INTERACTION_CONSTANTS.SVG_TYPE.SVG_MARK.join());
        let g_x_axis = svg.select("#x-axis");
        let g_y_axis = svg.select("#y-axis");
        let g_main = document.getElementById("main");
        let dots = d3.select("#dots");
        let matches = g_main.getAttribute("transform").match(/(\d+)/g);
        let width = el.getAttribute("width") - matches[1];
        let height = el.getAttribute("height") - matches[0];
        let extent = [[0, 0], [width, height]];

        svg.call(d3.zoom().extent(extent).translateExtent(extent).on("zoom", function({transform}) {
            g.attr("transform", transform);

            let x = d3.scaleLinear()
                .domain([4*0.95, 8*1.001])
                .range([0, width]);
            let y = d3.scaleLinear()
                .domain([-0.001, 9*1.01])
                .range([height, 0]);
            let xAxis = (g, x) => g
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).tickSize(-height*1.3).ticks(10))
                .call(g => g.select(".domain").attr("display", "none"));
            let yAxis = (g, x) => g
                .call(d3.axisLeft(x).tickSize(-width*1.3).ticks(7))
                .call(g => g.select(".domain").attr("display", "none"));
            const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
            const zy = transform.rescaleX(y).interpolate(d3.interpolateRound);

            g_x_axis.call(xAxis, zx);
            g_y_axis.call(yAxis, zy);
        }));

        if (!enabled_interactions[INTERACTION_CONSTANTS.INTERACTION_TYPES.PAN]) {
            svg.call(d3.zoom().extent(extent).translateExtent(extent).on("zoom", function({transform}) {
                g.attr("transform", transform);
    
                let x = d3.scaleLinear()
                    .domain([4*0.95, 8*1.001])
                    .range([0, width]);
                let y = d3.scaleLinear()
                    .domain([-0.001, 9*1.01])
                    .range([height, 0]);
                let xAxis = (g, x) => g
                    .attr("transform", `translate(0,${height})`)
                    .call(d3.axisBottom(x).tickSize(-height*1.3).ticks(10))
                    .call(g => g.select(".domain").attr("display", "none"));
                let yAxis = (g, x) => g
                    .call(d3.axisLeft(x).tickSize(-width*1.3).ticks(7))
                    .call(g => g.select(".domain").attr("display", "none"));
                const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
                const zy = transform.rescaleX(y).interpolate(d3.interpolateRound);
    
                g_x_axis.call(xAxis, zx);
                g_y_axis.call(yAxis, zy);
            }))
            .on("mousedown.zoom", null)
            .on("touchstart.zoom", null)
            .on("touchmove.zoom", null)
            .on("touchend.zoom", null);
        }

        observer.disconnect();
        // Clipping
        svg.selectAll("defs").remove();
      svg.append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
          .attr('x', 0)
         .attr('y', 0)
          .attr('width', width)
          .attr('height', height);
  
        dots
        .attr('clip-path', 'url(#clip)');

        observer.observe(document.body, config);
    }
}
