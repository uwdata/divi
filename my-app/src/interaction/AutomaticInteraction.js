import * as d3 from "d3";
import React, { useEffect, useState } from "react";
import INTERACTION_CONSTANTS from "../Constants";

function AutomaticInteraction(props) {
    const [enabled_interactions, set_enabled_interactions] = useState({
        [INTERACTION_CONSTANTS.INTERACTION_TYPES.SELECTION]: false,
        [INTERACTION_CONSTANTS.INTERACTION_TYPES.ZOOM]: true,
        [INTERACTION_CONSTANTS.INTERACTION_TYPES.PAN]: true,
        [INTERACTION_CONSTANTS.INTERACTION_TYPES.BRUSH]: false
    });
    let svg_container = null;
    let svg_groups = [];
    let svg_marks = [];

    const DEFAULT_OPTIONS = {
        config: { attributes: false, childList: true, subtree: true },
    };
    const observer = new MutationObserver(cb);
    const { config } = DEFAULT_OPTIONS;

    useEffect(() => {
        observer.observe(document.body, config);
        
        return () => {
            if (observer) {
                console.log("disconnect");
                observer.disconnect();
            }
        };
    }, [observer, config]);

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

    function add_brush() {
        if (enabled_interactions[INTERACTION_CONSTANTS.INTERACTION_TYPES.BRUSH]) {
            let el = document.getElementById("chart");
            let svg = d3.select("#chart");
            let g = svg.selectAll(INTERACTION_CONSTANTS.SVG_TYPE.SVG_MARK.join());
            let g_main = document.getElementById("main");
            let matches = g_main.getAttribute("transform").match(/(\d+)/g);
            let width = el.getAttribute("width") - matches[1];
            let height = el.getAttribute("height") - matches[0];
            let extent = [[0, 0], [width, height]];
            let xScale = d3.scaleLinear()
                .domain([4*0.95, 8*1.001])
                .range([0, width]);
            let yScale = d3.scaleLinear()
                .domain([-0.001, 9*1.01])
                .range([height, 0]);

            svg.call(d3.brush().extent(extent).on("brush", function brushed({selection}) {
                    if (selection === null) {
                      g.attr("stroke", null);
                    } else {
                        console.log(g);
                      const [[x0, y0], [x1, y1]] = selection;
                      let t = g.filter(function(d){
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
    }

    function add_selection() {

    }

    function generate_interactions() {
        add_zoom_pan();
        add_brush();
        add_selection();
    }

    function cb() {
        svg_container =  null;
        svg_groups = [];
        svg_marks = [];
        walk_svg(document.body);
        generate_interactions();
    }

    function walk_svg(el) {
        if (el == null) {
            return;
        }
    
        if (el.nodeName == INTERACTION_CONSTANTS.SVG_TYPE.SVG_CONTAINER) {
            svg_container = el;
            if (!svg_container.hasAttribute("id")) {
                svg_container.setAttribute("id", "svg_plot");
            }
        }
    
        if (el.nodeName == INTERACTION_CONSTANTS.SVG_TYPE.SVG_GROUP) {
            svg_groups.push(el);
        }
    
        for (const mark_type of INTERACTION_CONSTANTS.SVG_TYPE.SVG_MARK) {
            if (el.nodeName == mark_type) {
                svg_marks.push(el);
                break;
            }
        }
        
        for (const child of el.childNodes) {
            walk_svg(child);
        }
    }

    function checkbox_onchange(el) {
        set_enabled_interactions(prevState => {
            if (el.target.value == INTERACTION_CONSTANTS.INTERACTION_TYPES.PAN && 
                !prevState[INTERACTION_CONSTANTS.INTERACTION_TYPES.PAN]) {
                prevState[INTERACTION_CONSTANTS.INTERACTION_TYPES.BRUSH] = false;
            }
            else if (el.target.value == INTERACTION_CONSTANTS.INTERACTION_TYPES.BRUSH && 
                !prevState[INTERACTION_CONSTANTS.INTERACTION_TYPES.BRUSH]) {
                prevState[INTERACTION_CONSTANTS.INTERACTION_TYPES.PAN] = false;
            }

            return ({ 
                ...prevState,
                [el.target.value]: !prevState[el.target.value]
            });
        });
    }

    return (
        <div>
            <div>
                <input type="checkbox" value="Selection" id="Selection" 
                    checked={enabled_interactions[INTERACTION_CONSTANTS.INTERACTION_TYPES.SELECTION]} 
                    onChange={checkbox_onchange}/>Selection
                <input type="checkbox" value="Zoom" id="Zoom" 
                    checked={enabled_interactions[INTERACTION_CONSTANTS.INTERACTION_TYPES.ZOOM]} 
                    onChange={checkbox_onchange} />Zoom
                <input type="checkbox" value="Pan" id="Pan" 
                    checked={enabled_interactions[INTERACTION_CONSTANTS.INTERACTION_TYPES.PAN]}  
                    onChange={checkbox_onchange} />Pan
                <input type="checkbox" value="Brush" id="Brush" 
                    checked={enabled_interactions[INTERACTION_CONSTANTS.INTERACTION_TYPES.BRUSH]}
                    onChange={checkbox_onchange} />Brush
                <br/>
            </div>
            {props.children}
        </div>
    );
}

export default AutomaticInteraction;
