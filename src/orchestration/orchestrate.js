import { 
    Selection, Zoom, Pan, Brush, Filter, Sort, 
    Annotate, Arrange, Path, Ellipse
} from '../state/constants.js';

import { groupLabels, groupAxis, computeDomain, 
    configureAxes 
} from '../util/axis-parsers.js';

import { groupLegend } from '../util/legend-parsers.js';
import { min, max } from 'd3-array';
import { axisBottom, axisLeft } from '../_d3/axis';

import { inspect } from './inspect.js';
// import { select } from '../handlers/select.js';
// import { zoom } from '../handlers/zoom.js';
// import { brush } from '../handlers/brush.js';
// import { filter } from '../handlers/filter.js';
// import { sort } from '../handlers/sort.js';
// import { annotate } from '../handlers/annotate.js';
// import { arrange } from '../handlers/arrange.js';

export function orchestrate(svg) { 
    var state = inspect(svg);
    initialize();

    function initialize() {
        // state.svg.style['cursor'] = 'crosshair';

        // Initialize interactions
        // select(state);
        // zoom(state);
        // brush(state);
        // filter(state);
        // sort(state);
        // annotate(state);
        // arrange(state);

        // Infer view information
        analyzeAxes();
        // inferMarkAttributes();
        // inferView();
    }

    function analyzeAxes() {
        groupAxis(state.xAxis, 'left');
        groupAxis(state.yAxis, 'top');
        groupLabels(state);
        groupLegend(state);
    }

    function inferMarkAttributes() { 
        for (const mark of state.svgMarks) {
            if (mark.nodeName !== Path || (!state.xAxis.ticks.length && !state.yAxis.ticks.length) || 
               (mark.nodeName === Path && mark.type === Ellipse)) {
                if (mark.__data__) {
                    if (typeof mark.__data__ === 'string' || typeof mark.__data__ === 'number') {
                        var iterable = mark.__data__;
                        break;
                    }
    
                    let hasDatum = 'datum' in mark.__data__;
                    let hasProperties = 'properties' in mark.__data__;
                    let hasData = 'data' in mark.__data__;
                
                    var iterable = hasDatum 
                    ? mark.__data__.datum : hasProperties 
                    ? mark.__data__.properties : hasData 
                    ? mark.__data__.data : mark.__data__;
                } else {
                    let markX = (mark.clientRect.left + mark.clientRect.right) / 2
                        - state.xAxis.ticks[0]['ticks'][0].parentNode._global_transform[0]
                        - state.svg.clientRect.left;
                    let markY = (mark.clientRect.top + mark.clientRect.bottom) / 2
                        - state.yAxis.ticks[0]['ticks'][0].parentNode._global_transform[1]
                        - state.svg.clientRect.top;
    
                    var iterable = {
                        [state.titles.x.innerHTML]: state.xAxis.scale.invert(markX).toFixed(2),
                        [state.titles.y.innerHTML]: state.yAxis.scale.invert(markY).toFixed(2)
                    }
                }

                mark.style['pointer-events'] = 'fill';
                mark.__inferred__data__ = iterable;
            }
        }
    }

    function inferView() {
        computeDomain(state.xAxis);
        computeDomain(state.yAxis);
    
        const width = +state.svg.getAttribute('width');
        const height = +state.svg.getAttribute('height');
    
        if (!state.xAxis.ticks.length && !state.yAxis.ticks.length) {
            state.xAxis.range = state.xAxis.globalRange = [0, width];
            state.yAxis.range = state.yAxis.globalRange = [height, 0];
            return;
        }
        
        // TO-DO: Domain path 0.5 difference.
        if (state.hasDomain) {
            let axes = [].slice.call(state.svg.querySelectorAll(".domain")).map((d) => { return d.getBoundingClientRect() });
            let y_axis = axes[0].width < axes[1].width ? axes[0] : axes[1];
            let x_axis = axes[0].height < axes[1].height ? axes[0] : axes[1];
    
            var x_min = x_axis.left - state.svg.getBoundingClientRect().left;
            var x_max = x_axis.right - state.svg.getBoundingClientRect().left;
    
            var y_max = y_axis.bottom - state.svg.getBoundingClientRect().top;
            var y_min = y_axis.top - state.svg.getBoundingClientRect().top;
        } else {
            let y_tick = state.y_axis.ticks[0]['ticks'][0].getBoundingClientRect();
            let x_tick = state.x_axis.ticks[0]['ticks'][0].getBoundingClientRect();
    
            if (y_tick.right < x_tick.left) {
                var x_min = y_tick.right - state.svg.getBoundingClientRect().left;
                var x_max = width;
            } else {
                var x_min = y_tick.left - state.svg.getBoundingClientRect().left;
                var x_max = d3.min([y_tick.width + x_min, width]);
            }
    
            if (x_tick.top > y_tick.bottom) {
                var y_max = x_tick.top - state.svg.getBoundingClientRect().top;
                var y_min = 0;
            } else {
                var y_max = x_tick.bottom - state.svg.getBoundingClientRect().top;
                var y_min = d3.max([y_max - x_tick.height, 0]);
            }
        }
    
        //     var x_min = d3.min(state.y_axis.ticks[0]['ticks'].map(d => d.getBoundingClientRect().left - state.svg.getBoundingClientRect().left));
        //     var x_max = d3.min([d3.max(state.y_axis.ticks[0]['ticks'].map(d => d.getBoundingClientRect().width + x_min)), width]);
    
        //     var y_max = d3.max(state.x_axis.ticks[0]['ticks'].map(d => d.getBoundingClientRect().bottom - state.svg.getBoundingClientRect().top));
        //     var y_min = d3.max([d3.min(state.x_axis.ticks[0]['ticks'].map(d => y_max - d.getBoundingClientRect().height)), 0]);
        // }
    
    
        // state.x_axis.range = [x_min, x_max].map(d => d - state.x_axis.ticks[0]['ticks'][0]._global_transform[0]);
        // state.y_axis.range = [y_max, y_min].map(d => d - state.y_axis.ticks[0]['ticks'][0]._global_transform[1]);
        state.x_axis.global_range = [x_min, x_max];
        state.y_axis.global_range = [y_max, y_min];
        state.x_axis.range = [x_min, x_max].map(d => d - state.x_axis.ticks[0]['ticks'][0].parentNode._global_transform[0]);
        state.y_axis.range = [y_max, y_min].map(d => d - state.y_axis.ticks[0]['ticks'][0].parentNode._global_transform[1]);
    
        let diff_1_y = +state.y_axis.ticks[1]['label'].innerHTML - +state.y_axis.ticks[0]['label'].innerHTML;
        let diff_2_y = +state.y_axis.ticks[2]['label'].innerHTML - +state.y_axis.ticks[1]['label'].innerHTML;
    
        let diff_1_x = +state.x_axis.ticks[1]['label'].innerHTML - +state.x_axis.ticks[0]['label'].innerHTML;
        if (state.x_axis.ticks.length < 3) {
            var diff_2_x = 0;
        } else {
            var diff_2_x = +state.x_axis.ticks[2]['label'].innerHTML - +state.x_axis.ticks[1]['label'].innerHTML;
        }
    
        let diff_tick_a = state.x_axis.ticks[1]['ticks'][0].getBoundingClientRect().left - 
            state.x_axis.ticks[0]['ticks'][0].getBoundingClientRect().left;
    
        if (state.x_axis.ticks.length < 3) {
            var diff_tick_b = 0;
        } else {
            var diff_tick_b = state.x_axis.ticks[2]['ticks'][0].getBoundingClientRect().left - 
                state.x_axis.ticks[1]['ticks'][0].getBoundingClientRect().left;
        }
    
        if (Math.abs(diff_1_x - diff_2_x) > 5e-1 || Math.abs(diff_tick_a - diff_tick_b) > 5e-1) {
            // let tick_diff_1 = state.x_axis.ticks['ticks'][1].getBoundingClientRect().left - 
            //     state.x_axis.ticks['ticks'][0].getBoundingClientRect().left;
            // let tick_diff_2 = state.x_axis.ticks['ticks'][2].getBoundingClientRect().left - 
            //     state.x_axis.ticks['ticks'][1].getBoundingClientRect().left;
    
            if (Math.abs(diff_tick_a - diff_tick_b) < 5e-1) {
                let format = state.x_axis.ticks['ticks'][0].childNodes[1].innerHTML;
                if (format != state.x_axis.ticks[0].__data__ && typeof format === "string") { 
                    var exponent = format.match(/^(e|\d+)\^(e|\d+)$/);
                    var superscript = format.match(/^(e|d+)([\u2070-\u209F\u00B2\u00B3\u00B9])$/);
                    if (exponent) {
                        var base = exponent[1];
                        base = (base === 'e' ? Math.E : parseInt(base));
                    } else if (superscript) {
                        var base = superscript[1];
                        base = (base === 'e' ? Math.E : parseInt(base));
                    }
                }
            } 
            
            function format(d) {
                function digitToSuperscript(superChar) {
                    let table = "⁰¹²³⁴⁵⁶⁷⁸⁹";
                    return table[superChar];
                }
    
                let exp = Math.log(d) / Math.log(base);
                return superscript ? 'e' + String(exp).replace(/\d/g, digitToSuperscript) : d + '^' + exp;
            }
    
            state.x_axis.scale = d3.scaleLog()
                .domain(state.x_axis.domain)
                .range(state.x_axis.range);
            state.x_axis.axis = axisBottom(state.x_axis.scale, SVG)
                // .tickSize(state.x_axis.ticks[1].children[0].getAttribute("y2"))
                .ticks(state.x_axis.ticks.filter(d => d['label'].innerHTML).length)
            if (base) {
                state.x_axis.scale = state.x_axis.scale.base(base);
                state.x_axis.axis = state.x_axis.axis.tickFormat(d => exponent || superscript ? format(d) : d);
            }
        } else {
            state.x_axis.scale = (state.x_axis.domain[0] instanceof Date ? d3.scaleTime() : (state.x_axis.ordinal.length ? d3.scaleBand() : d3.scaleLinear()))
                .domain(state.x_axis.ordinal.length ? state.x_axis.ordinal : state.x_axis.domain)
                .range(state.x_axis.range)
            // state.x_axis.scale = (state.x_axis.domain[0] instanceof Date ? d3.scaleTime() : d3.scaleLinear())
            //     .domain(state.x_axis.ordinal.length ? state.x_axis.range : state.x_axis.domain)
            //     .range(state.x_axis.range);
            state.x_axis.axis = axisBottom(state.x_axis.scale, SVG)
                .ticks(state.x_axis.ticks.length);
            // state.x_axis.axis(state.x_axis.ticks);
                // .tickSize(state.x_axis.ticks[1].children[0].getAttribute("y2"))
                // .ticks(typeof x_axis.ticks[0].__data__ === "string" ? state.x_axis.ordinal.length : state.x_axis.ticks.length);
        }
    
        if (Math.abs(diff_1_y - diff_2_y) > 5e-1) {
            state.y_axis.scale = d3.scaleLog()
                .domain(state.y_axis.domain)
                .range(state.y_axis.range);
            state.y_axis.axis = d3.axisLeft(state.y_axis.scale)
                .tickSize(-state.y_axis.ticks[1].children[0].getAttribute("x2"))
                .ticks(state.y_axis.ticks.length);
        } else {
            state.y_axis.scale = (state.y_axis.domain[0] instanceof Date ? d3.scaleTime() : (state.y_axis.ordinal.length ? d3.scaleBand() : d3.scaleLinear()))
                .domain(state.y_axis.ordinal.length ? state.y_axis.ordinal : state.y_axis.domain)
                .range(state.y_axis.range);
            state.y_axis.axis = axisLeft(state.y_axis.scale, SVG)
                .ticks(state.y_axis.ticks.length)
                .tickFormat(d => {
                    let s = state.y_axis.ticks[0]['label'].innerHTML;
                    return s.includes("M") || s.includes("k") ? d3.format(".2s")(d) : d3.format(",")(d);
                });
            // state.y_axis.axis(state.y_axis.ticks);
                // .tickSize(-state.y_axis.ticks[1].children[0].getAttribute("x2"))
                // .ticks(typeof state.y_axis.ticks[0].__data__ === "string" ? state.y_axis.ordinal.length : state.y_axis.ticks.length);
        }
    
        configure_axes();
    }
}

//    function filter(x, y, width, height, append=false) {
//         document.getElementById("filter_mode").style['opacity'] = 1;
//         document.getElementById("filter_mode").style['display'] = 'block';
    
//         for (const mark of state.svg_marks) {
//             if (mark.style["visibility"] === "hidden" || mark.hasAttribute("__legend__")) continue;
    
//             if ((mark.type === "line" || mark.type === "polygon" || mark.type === "polyline") && state.x_axis.ticks.length && state.y_axis.ticks.length) {
//                 state.interactions.brush.active = true;
//                 select.applyBrush(SVG, x, y, width, height);
//                 return;
//             }
            
//             if (state.x_axis.ordinal.length || (!state.x_axis.ticks.length && !state.y_axis.ticks.length)) {
//                 var brush_x_start = x;
//                 var brush_x_end = x + +width;
//                 var brush_y_end = y + +height;
//                 var brush_y_start = y;
    
//                 let bb = mark.getBoundingClientRect();
//                 var data_x = (+bb.left + +bb.right) / 2;
//                 var data_y = (+bb.top + +bb.bottom) / 2;
//             } else {
//                 var brush_x_start = state.x_axis.scale.invert(x);
//                 var brush_x_end = state.x_axis.scale.invert(x + +width);
//                 var brush_y_end = state.y_axis.scale.invert(y);
//                 var brush_y_start = state.y_axis.scale.invert(y + +height);
    
//                 let bb = mark.getBoundingClientRect();
//                 var data_x = (state.x_axis.scale.invert(+bb.left) + state.x_axis.scale.invert(+bb.right)) / 2;
//                 var data_y = (state.y_axis.scale.invert(+bb.top) + state.y_axis.scale.invert(+bb.bottom)) / 2;
//             }
    
//             if (data_x < brush_x_start || data_x > brush_x_end || data_y < brush_y_start || data_y > brush_y_end) {
//                 if (!append) {
//                     mark.setAttribute("opacity", 0.25);
//                 }
//             } else {
//                 mark.setAttribute("opacity", 1);
//             }
//         }
//     }


    //     // Tooltip
    //     let mousedown = false;
    //     state.svg.addEventListener('mousedown', function(event) {
    //         mousedown = true;
    //     });
    //     state.svg.addEventListener('mouseup', function(event) {
    //         mousedown = false;
    //     });
    //     state.svg.addEventListener('mousemove', function(event) {
    //         if (!mousedown) document.getElementById("modebar").style['visibility'] = 'visible';

    //         if (state.interactions.pan.flag) {
    //             let left_bound = state.svg_marks[0]._global_transform[0] + SVG.state().svg.getBoundingClientRect().left;
    //             let top_bound = state.svg_marks[0]._global_transform[1] + SVG.state().svg.getBoundingClientRect().top;

    //             let x_axis = event.clientX - left_bound > state.x_axis.range[0], 
    //                 y_axis = event.clientY - top_bound < state.y_axis.range[0];

    //             state.svg.style['cursor'] = x_axis && !y_axis ? 'ew-resize' :
    //                 !x_axis && y_axis ? 'ns-resize' : 'move';
    //         }
    //     });
    //     state.svg.addEventListener('mouseleave', function(event) {
    //         if (event.clientX <= +state.svg.getBoundingClientRect().left || event.clientX >= +state.svg.getBoundingClientRect().right) {
    //             document.getElementById("modebar").style['visibility'] = 'hidden';
    //         }
    //     });

    //     let pan_elem = document.getElementById("pan_mode");
    //     let brush_elem = document.getElementById("brush_mode");
    //     let filter_elem = document.getElementById("filter_mode");
    //     let annotate_elem = document.getElementById("annotate_mode");

    //     pan_elem.addEventListener("click", function(event) {
    //         if (state.svg.parentNode.style['visibility'] === 'hidden') return;

    //         pan_elem.style['opacity'] = +pan_elem.style['opacity'] === 0.4 ? 1 : 0.4;
    //         brush_elem.style['opacity'] = 0.4;
    //         annotate_elem.style['opacity'] = 0.4;

    //         state.interactions.pan.flag = !state.interactions.pan.flag;
    //         state.interactions.brush.flag = false;
    //         state.interactions.annotate.flag = false;
    //         state.svg.style['cursor'] = 'move';

    //         // document.getElementById("logfile").innerHTML += "Click " + state.svg.id + " " +
    //             // (+pan_elem.style['opacity'] === 0.4 ? "disable" : "enable") + " pan <br/>";
    //     });
    //     brush_elem.addEventListener("click", function(event) {
    //         if (state.svg.parentNode.style['visibility'] === 'hidden') return;

    //         brush_elem.style['opacity'] = +brush_elem.style['opacity'] === 0.4 ? 1 : 0.4;
    //         pan_elem.style['opacity'] = 0.4;
    //         annotate_elem.style['opacity'] = 0.4;

    //         state.interactions.annotate.flag = false;
    //         state.interactions.pan.flag = false;
    //         state.interactions.brush.flag = !state.interactions.brush.flag;
    //         state.svg.style['cursor'] = 'crosshair';

    //         // document.getElementById("logfile").innerHTML += "Click " + state.svg.id + " " +
    //             // (+brush_elem.style['opacity'] === 0.4 ? "disable" : "enable") + " brush <br/>";
    //     });

    //     filter_elem.addEventListener("click", function(event) {
    //         if (state.svg.parentNode.style['visibility'] === 'hidden') return;
            
    //         // let append = false;
    //         // for (const mark of state.svg_marks) {
    //         //     if (mark.style['visibility'])
    //         // }
    //         // if (!state.interactions.filter.active || !document.querySelectorAll('[visibility="hidden"]')) {
    //             state.interactions.filter.active = !state.interactions.filter.active;
    //             state.interactions.brush.flag = false;
    //         state.interactions.annotate.flag = false;
    //         // } 
    //         let el;
    //         for (const mark of state.svg_marks) {
    //             if (mark.hasAttribute("__legend__")) continue;
    //             mark.style['visibility'] = state.interactions.filter.active ? 
    //                 +mark.getAttribute("opacity") === 1 ? 'visible' : 'hidden'
    //                 : 'visible'
    //             if (mark.style['visibility'] === 'visible') el = mark;

    //             // for (const tick of state.x_axis.ticks) {
    //             //     let offset = (+mark.getBoundingClientRect().left + +mark.getBoundingClientRect().right) / 2;
    //             //     let t_offset = (+tick['ticks'][0].getBoundingClientRect().left + +tick['ticks'][0].getBoundingClientRect().right) / 2;
    //             //     let l_offset = (+tick['label'].getBoundingClientRect().left + +tick['label'].getBoundingClientRect().right) / 2;
    //             //     if (Math.abs(offset - t_offset) < 1 && mark.style['visibility'] !== 'visible') {
    //             //         // tick['label'].style['visibility'] = 'hidden';
    //             //         tick['ticks'][0].style['visibility'] = 'hidden';
    //             //     }
    //             //     if (Math.abs(offset - l_offset) < 20 && mark.style['visibility'] !== 'visible') {
    //             //         tick['label'].style['visibility'] = 'hidden';
    //             //     }
    //             // }
    //         }
    //         console.log(el)

    //         // for (const l of state.legend) {
    //         //     console.log(l)
    //         //     if (window.getComputedStyle(l['glyph']).fill !== window.getComputedStyle(el).stroke) {
    //         //         l['label'].setAttribute("opacity", 0);
    //         //         l['glyph'].setAttribute("opacity", 0);
    //         //     } else {
    //         //         l['label'].setAttribute("opacity", 1);
    //         //         l['glyph'].setAttribute("opacity", 1);
    //         //         l['label'].style['visibility'] = 'visible';
    //         //         l['glyph'].style['visibility'] = 'visible';
    //         //     }
    //         // }

    //         // document.getElementById("logfile").innerHTML += "Click " + state.svg.id + " " +
    //             // (state.interactions.filter.active ? "enable" : "disable") + " filter <br/>";
    //     });
    //     annotate_elem.addEventListener("click", function(event) {
    //         if (state.svg.parentNode.style['visibility'] === 'hidden') return;

    //         annotate_elem.style['opacity'] = +annotate_elem.style['opacity'] === 0.4 ? 1 : 0.4;
    //         pan_elem.style['opacity'] = 0.4;
    //         brush_elem.style['opacity'] = 0.4;

    //         state.interactions.brush.flag = false;
    //         state.interactions.pan.flag = false;
    //         state.interactions.annotate.flag = !state.interactions.annotate.flag;
    //         state.svg.style['cursor'] = 'pointer';

    //         // +annotate_elem.style['opacity'] === 0.4 ? annotate.unbind() : annotate.bind(SVG);
    //         // document.getElementById("logfile").innerHTML += "Click " + state.svg.id + " " +
    //             // (+annotate_elem.style['opacity'] === 0.4 ? "disable" : "enable") + " annotate <br/>";
    //     });
    // }

    // unfilter = function() {
    //     state.interactions.brush.active = false;
    //     let append = false;
    
    //     for (const mark of state.svg_marks) {
    //         mark.style["visibility"] === "hidden" ? append = true : mark.setAttribute("opacity", 1);
    //     }
    //     if (!append) document.getElementById("filter_mode").style['display'] = 'none';
    // }
