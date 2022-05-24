import { 
    Selection, Zoom, Pan, Brush, Filter, Sort, 
    Annotate, Arrange, Path, Ellipse
} from '../state/constants.js';

import { groupLabels, groupAxis, computeDomain, 
    configureAxes, constructAxes
} from '../util/view-parsers.js';

import { inferMarkAttributes } from '../util/attribute-parsers.js';

import { inspect } from './inspect.js';
// import { select } from '../handlers/select.js';
import { zoom } from '../handlers/zoom.js';
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
        // brush(state);
        // filter(state);
        // sort(state);
        // annotate(state);
        // arrange(state);

        // Infer view information
        analyzeAxes(state);
        // inferMarkAttributes();
        // inferView();
        zoom(state);
    }

    function analyzeAxes(state) {
        // groupAxis(state.xAxis, 'left');
        // groupAxis(state.yAxis, 'top');
        // groupLabels(state);
        // groupLegend(state);
        constructAxes(state);
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
