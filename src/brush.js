import { INTERACTION_CONSTANTS } from "./constants";

export function brush(id) {
    let el = document.querySelector(id);
    let svg = d3.select(id);
    let g = svg.selectAll(INTERACTION_CONSTANTS.SVG_TYPE.SVG_MARK.join());
    let g_main = document.getElementById("main");
    let matches = g_main.getAttribute("transform").match(/(\d+)/g);
    let width = el.getAttribute("width");
    let height = el.getAttribute("height");
    let extent = [[0, 0], [width, height]];
    let xScale = d3.scaleLinear()
        .domain([4*0.95, 8*1.001])
        .range([0, width]);
    let yScale = d3.scaleLinear()
        .domain([-0.001, 9*1.01])
        .range([height, 0])
        .nice();
    svg.call(d3.brush().extent(extent).on("start brush end", function brushed({selection}) {
            let value = [];
            if (selection) {
              const [[x0, y0], [x1, y1]] = selection;
              value = g
                .style("stroke", "none")
                .filter(d => x0 <= xScale(d['Sepal_Length']) && xScale(d['Sepal_Length']) < x1 && 
                    y0 <= yScale(d['Petal_Length']) && yScale(d['Petal_Length']) < y1)
                .style("stroke", "red")
            } else {
              g.style("stroke", "none");
            }
            svg.property("value", value).dispatch("input");
    }));
    return;
    svg.call(d3.brush().extent(extent).on("brush", function brushed({selection}) {
            if (selection === null) {
                g.attr("stroke", null);
            } else {
                console.log(selection);
                const [[x0, y0], [x1, y1]] = selection;
                let t = g.each(function(d){
                    let d_x = d['Sepal_Length'];
                    let d_y = d['Petal_Length'];
                //   console.log(d);
                //   console.log(x0);
                //   console.log(y0);
                //   console.log(x1);
                //   console.log(y1);
                //   console.log(d_x);
                //   console.log(xScale(d_x));
                //   console.log(d_y);
                //   console.log(yScale(d_y));
                //   console.log();
                return xScale(d_x) >= x0 && 
                        yScale(d_y) <= y1 &&
                        xScale(d_x) <= x1 && 
                        yScale(d_y) >= y0;                                          
                }).attr("stroke", "red");
            }
            }));
}
