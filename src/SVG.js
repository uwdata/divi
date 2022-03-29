import { format } from 'd3';
import { _zoom } from './zoom.js';
import { brush } from './brush.js';
import { filter } from './filter.js';
import { sort } from './sort.js';
import { select } from './select.js';
import { min, max } from 'd3-array';
import { INTERACTION_CONSTANTS } from './constants';
import { axisBottom, axisLeft } from './d3/axis';
import { svg } from 'd3';
import { annotate } from './annotate.js';

export default function() {
    var state = {
        has_domain: false,
        svg: null,
        svg_marks: [],
        text_marks: [],
        axis_text_marks: [],
        x_axis: {
            domain: [null, null],
            ordinal: [],
            range: [null, null],
            global_range: [null, null],
            ticks: [],
            scale: null,
            axis: null
        },
        y_axis: {
            domain: [null, null],
            ordinal: [],
            range: [null, null],
            global_range: [null, null],
            ticks: [],
            scale: null,
            axis: null
        },
        legend: [],
        titles: {
            x: null,
            y: null
        },
        interactions: {
            selection: {
                control: null,
                active: false
            },
            zoom: {
                control: null,
                axis_control: null
            },
            pan: {
                control: null,
                axis_control: null,
                flag: false
            },
            brush: {
                control: null,
                axis_control: null,
                flag: true,
                active: false
            },
            filter: {
                control: null,
                active: false
            },
            sort: {
                control: null
            },
            annotate: {
                flag: false
            }
        }
    }

    var group_labels = function() {
        for (let i = 0; i < state.axis_text_marks.length; ++i) {
            let x_offset = (+state.axis_text_marks[i].getBoundingClientRect().left + +state.axis_text_marks[i].getBoundingClientRect().right) / 2;
            let y_offset = (+state.axis_text_marks[i].getBoundingClientRect().top + +state.axis_text_marks[i].getBoundingClientRect().bottom) / 2;

            let x_min = 0, y_min = 0;
            for (let j = 0; j < state.x_axis.ticks.length; ++j) {
                if (Math.abs(x_offset - state.x_axis.ticks[j]['offset']) < Math.abs(x_offset - state.x_axis.ticks[x_min]['offset'])) {
                    x_min = j;
                }
            }
            
            for (let j = 0; j < state.y_axis.ticks.length; ++j) {
                if (Math.abs(y_offset - state.y_axis.ticks[j]['offset']) < Math.abs(y_offset - state.y_axis.ticks[y_min]['offset'])) {
                    y_min = j;
                }
            }
  
            Math.abs(x_offset - state.x_axis.ticks[x_min]['offset']) < Math.abs(y_offset - state.y_axis.ticks[y_min]['offset']) ? 
            state.x_axis.ticks[x_min]['label'] = state.axis_text_marks[i] :
            state.y_axis.ticks[y_min]['label'] = state.axis_text_marks[i];

            state.axis_text_marks[i].setAttribute("class", "tick");
        }
    }

    var group_axis = function (axis, index) {
        let position_map = { };

        for (let i = 0; i < axis.ticks.length; ++i) {
            let offset = axis.ticks[i].getBoundingClientRect()[index];
            axis.ticks[i].setAttribute("class", (index === "left" ? "x-axis" : "y-axis") + " tick");

            offset in position_map ? 
            position_map[offset]['ticks'].push(axis.ticks[i]) :
            position_map[offset] = { 'label': null, 'ticks': [axis.ticks[i]] };
        }

        axis.ticks = [];
        for (const [key, value] of Object.entries(position_map)) {
            value['offset'] = +key;
            axis.ticks.push(value);
        }

        axis.ticks.sort((first, second) => +first['offset'] < +second['offset'] ? -1 : (+first['offset'] > +second['offset'] ? 1 : 0))
    }

    var group_legend = function() {
        if (state.svg.id === "hexchart") return;
        let title_x, title_y,
            min_x = 10000, max_y = 0;
        for (const text of state.text_marks) {
            if (text.getBoundingClientRect().left < min_x) {
                min_x = text.getBoundingClientRect().left;
                title_y = text;
            }
            if (text.getBoundingClientRect().bottom > max_y) {
                max_y = text.getBoundingClientRect().bottom;
                title_x = text;
            }
        }

        if (title_y && Math.abs(min_x - state.svg.getBoundingClientRect().left) < 50) {
            title_y.__title__ = true;
            state.titles.y = title_y;
        }
        if (title_x && Math.abs(max_y - state.svg.getBoundingClientRect().bottom) < 50) {
            title_x.__title__ = true;
            state.titles.x = title_x;    
        }

        for (const text of state.text_marks) {
            if (text.__title__) continue;

            let text_x = (+text.getBoundingClientRect().left + +text.getBoundingClientRect().right) / 2,
                text_y = (+text.getBoundingClientRect().top + +text.getBoundingClientRect().bottom) / 2;
            let min_pos = 10000, min_mark;
            for (const mark of state.svg_marks) {
                let mark_x = (+mark.getBoundingClientRect().left + +mark.getBoundingClientRect().right / 2) / 2,
                    mark_y = (+mark.getBoundingClientRect().top + +mark.getBoundingClientRect().bottom) / 2;
                
                let diff = Math.abs(mark_x - text_x) + Math.abs(mark_y - text_y);
                if (diff < min_pos) {
                    min_pos = diff;
                    min_mark = mark;
                }
            }

            min_mark.removeAttribute("__mark__");
            text.setAttribute("__legend__", true);
            min_mark.setAttribute("__legend__", "true");
            state.legend.push({'label': text, 'glyph': min_mark});
        }
    }

    var compute_domain = function(axis) {
        for (const [_, value] of Object.entries(axis.ticks)) {
            let format_val = value['label'].__data__ || +value['label'].__data__ === 0 ? 
                value['label'].__data__ : 
                isNaN(parseInt(value['label'].innerHTML)) ? 
                value['label'].innerHTML :
                +(value['label'].innerHTML.replace(/,/g, ''));

            if (typeof format_val === "string") {
                axis.ordinal.push(format_val);
            } else {
                axis.domain[0] = axis.domain[0] === null ? format_val : min([axis.domain[0], format_val]);
                axis.domain[1] = axis.domain[1] === null ? format_val : max([axis.domain[1], format_val]);
            }
        }
    }

    var configure_axes = function() {
        if (SVG.state().x_axis.scale && !SVG.state().x_axis.ordinal.length) {
            // Infer original X-axis domain
            let tick_left = SVG.state().x_axis.ticks[0]['ticks'][0];
            let tick_right = SVG.state().x_axis.ticks[SVG.state().x_axis.ticks.length - 1]['ticks'][0];
            
            tick_left = +(tick_left.hasAttribute("transform") ? tick_left.getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[0] : tick_left._global_transform[0] - SVG.state().x_axis.global_range[0]);
            tick_right = +(tick_right.hasAttribute("transform") ? tick_right.getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[0] : tick_right._global_transform[0] - SVG.state().x_axis.global_range[0]);
    
            let new_domain_x = SVG.state().x_axis.range.map(
                SVG.state().x_axis.scale.copy().range([tick_left, tick_right]).invert, SVG.state().x_axis.scale
            );
            
            SVG.state().x_axis.scale.domain(new_domain_x);
        }
    
        // TO-DO: Fix transform bug.
        if (SVG.state().y_axis.scale && !SVG.state().y_axis.ordinal.length) {
            // Infer original Y-axis domain
            let tick_bottom = SVG.state().y_axis.ticks[0]['ticks'][0];
            let tick_top = SVG.state().y_axis.ticks[SVG.state().y_axis.ticks.length - 1]['ticks'][0];
            tick_bottom = +(tick_bottom.hasAttribute("transform") ? tick_bottom.getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[1] : tick_bottom._global_transform[1] - SVG.state().y_axis.global_range[1]);
            tick_top = +(tick_top.hasAttribute("transform") ? tick_top.getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[1] : tick_top._global_transform[1] - SVG.state().y_axis.global_range[1]);
    
            let new_domain_y = SVG.state().y_axis.range.map(
                SVG.state().y_axis.scale.copy().range([tick_top, tick_bottom]).invert, SVG.state().y_axis.scale
            );
     
            SVG.state().y_axis.scale.domain(new_domain_y);
        }
    }

    function SVG() { }

    SVG.hydrate = function() {
        // document.getElementById("pan-btn").addEventListener('click', function(event) {
        //     SVG.unfilter();
        //     document.getElementById("brush-rect").setAttribute("width", 0);
        //     document.getElementById("brush-rect").setAttribute("height", 0);
        //     document.getElementById("pan_disam").style['display'] = 'none';
        //     state.svg.style['cursor'] = 'default';
        //     state.interactions.pan.flag = true;
        //     state.interactions.brush.flag = false;
        // });

        // document.getElementById("brush-btn").addEventListener('click', function(event) {
        //     document.getElementById("brush_disam").style['display'] = 'none';
        //     state.svg.style['cursor'] = 'crosshair';
        //     state.interactions.pan.flag = false;
        //     state.interactions.brush.flag = true;
        // });

        for (const [key, value] of Object.entries(state.interactions)) {
            switch(key) {
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.SELECTION:
                    select(SVG, value.control);
                    break;
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.ZOOM:
                    _zoom(SVG, value.control, value.axis_control);
                    break;
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.PAN:
                    break;
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.BRUSH:
                    state.svg.style['cursor'] = 'crosshair';
                    brush(SVG, value.control, value.axis_control);
                    break;
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.FILTER:
                    filter(SVG, value.control);
                    break;
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.SORT:
                    sort(SVG);
                    break;
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.ANNOTATE:
                    annotate(SVG);
                    break;
            }
        }
        // if (state.svg.id !== "chart") return;
        // let field = document.getElementById("field");
        // let __data__ = state.svg_marks[0].__inferred__data__;
        // for (const [key, value] of Object.entries(__data__)) {
        //     let option = document.createElement('option');
        //     option.innerHTML = key;
        //     field.appendChild(option);
        // }

        // for (const attribute of state.svg_marks[0].attributes) {
        //     if (attribute.nodeName === "__mark__" || attribute.nodeName === "style") continue;
        //     let option = document.createElement('option');
        //     option.innerHTML = attribute.nodeName;
        //     field.appendChild(option);
        // }

        // let condition = document.getElementById("condition");
        // let conditions = ['<', '<=', '=', '>=', '>'];
        // for (const c of conditions) {
        //     let new_c = document.createElement('option');
        //     new_c.innerHTML = c;
        //     condition.appendChild(new_c);
        // }

        // Tooltip
        let mousedown = false;
        state.svg.addEventListener('mousedown', function(event) {
            mousedown = true;
        });
        state.svg.addEventListener('mouseup', function(event) {
            mousedown = false;
        });
        state.svg.addEventListener('mousemove', function(event) {
            if (!mousedown) document.getElementById("modebar").style['visibility'] = 'visible';

            if (state.interactions.pan.flag) {
                let left_bound = state.svg_marks[0]._global_transform[0] + SVG.state().svg.getBoundingClientRect().left;
                let top_bound = state.svg_marks[0]._global_transform[1] + SVG.state().svg.getBoundingClientRect().top;
    
                let x_axis = event.clientX - left_bound > state.x_axis.range[0], 
                    y_axis = event.clientY - top_bound < state.y_axis.range[0];

                state.svg.style['cursor'] = x_axis && !y_axis ? 'ew-resize' :
                    !x_axis && y_axis ? 'ns-resize' : 'move';
            }
        });
        state.svg.addEventListener('mouseleave', function(event) {
            if (event.clientX <= +state.svg.getBoundingClientRect().left || event.clientX >= +state.svg.getBoundingClientRect().right) {
                document.getElementById("modebar").style['visibility'] = 'hidden';
            }
        });

        let pan_func = function(event) {
            pan_elem.style['opacity'] = +pan_elem.style['opacity'] === 0.4 ? 1 : 0.4;
            brush_elem.style['opacity'] = 0.4;
            console.log(pan_elem.style['opacity'])
            state.interactions.pan.flag = !state.interactions.pan.flag;
            state.interactions.brush.flag = !state.interactions.brush.flag;
            state.svg.style['cursor'] = 'move';
        };

        let brush_func = function(event) {
            brush_elem.style['opacity'] = +brush_elem.style['opacity'] === 0.4 ? 1 : 0.4;
            pan_elem.style['opacity'] = 0.4;
            state.interactions.pan.flag = !state.interactions.pan.flag;
            state.interactions.brush.flag = !state.interactions.pan.flag;
            state.svg.style['cursor'] = 'crosshair';
        };

        let filter_func = function(event) {
            state.interactions.filter.active = !state.interactions.filter.active;
            for (const mark of state.svg_marks) {
                mark.style['visibility'] = state.interactions.filter.active ? 
                    +mark.getAttribute("opacity") === 1 ? 'visible' : 'hidden'
                    : 'visible'
            }
        };


        let pan_elem = document.getElementById("pan_mode");
        let brush_elem = document.getElementById("brush_mode");
        let filter_elem = document.getElementById("filter_mode");
        let annotate_elem = document.getElementById("annotate_mode");

        pan_elem.addEventListener("click", function(event) {
            if (state.svg.parentNode.style['visibility'] === 'hidden') return;

            pan_elem.style['opacity'] = +pan_elem.style['opacity'] === 0.4 ? 1 : 0.4;
            brush_elem.style['opacity'] = 0.4;
            annotate_elem.style['opacity'] = 0.4;

            state.interactions.pan.flag = !state.interactions.pan.flag;
            state.interactions.brush.flag = false;
            state.interactions.annotate.flag = false;
            state.svg.style['cursor'] = 'move';

            document.getElementById("logfile").innerHTML += "Click " + state.svg.id + " " +
                (+pan_elem.style['opacity'] === 0.4 ? "disable" : "enable") + " pan <br/>";
        });
        brush_elem.addEventListener("click", function(event) {
            if (state.svg.parentNode.style['visibility'] === 'hidden') return;

            brush_elem.style['opacity'] = +brush_elem.style['opacity'] === 0.4 ? 1 : 0.4;
            pan_elem.style['opacity'] = 0.4;
            annotate_elem.style['opacity'] = 0.4;

            state.interactions.annotate.flag = false;
            state.interactions.pan.flag = false;
            state.interactions.brush.flag = !state.interactions.brush.flag;
            state.svg.style['cursor'] = 'crosshair';

            document.getElementById("logfile").innerHTML += "Click " + state.svg.id + " " +
                (+brush_elem.style['opacity'] === 0.4 ? "disable" : "enable") + " brush <br/>";
        });
        filter_elem.addEventListener("click", function(event) {
            if (state.svg.parentNode.style['visibility'] === 'hidden') return;

            state.interactions.filter.active = !state.interactions.filter.active;
            for (const mark of state.svg_marks) {
                mark.style['visibility'] = state.interactions.filter.active ? 
                    +mark.getAttribute("opacity") === 1 ? 'visible' : 'hidden'
                    : 'visible'
            }

            document.getElementById("logfile").innerHTML += "Click " + state.svg.id + " " +
                (state.interactions.filter.active ? "enable" : "disable") + " filter <br/>";
        });
        annotate_elem.addEventListener("click", function(event) {
            if (state.svg.parentNode.style['visibility'] === 'hidden') return;

            annotate_elem.style['opacity'] = +annotate_elem.style['opacity'] === 0.4 ? 1 : 0.4;
            pan_elem.style['opacity'] = 0.4;
            brush_elem.style['opacity'] = 0.4;

            state.interactions.brush.flag = false;
            state.interactions.pan.flag = false;
            state.interactions.annotate.flag = !state.interactions.annotate.flag;
            state.svg.style['cursor'] = 'pointer';

            // +annotate_elem.style['opacity'] === 0.4 ? annotate.unbind() : annotate.bind(SVG);
            document.getElementById("logfile").innerHTML += "Click " + state.svg.id + " " +
                (+annotate_elem.style['opacity'] === 0.4 ? "disable" : "enable") + " annotate <br/>";
        });
    }

    SVG.infer_mark_attributes = function() { 
        for (const mark of state.svg_marks) {
            if (mark.nodeName !== "path" || (!state.x_axis.ticks.length && !state.y_axis.ticks.length) || (mark.nodeName === "path" && mark.type === "ellipse")) {
                if (mark.__data__) {
                    if (typeof mark.__data__ === "string") {
                        var iterable = mark.__data__;
                        break;
                    }
                    let has_datum = "datum" in mark.__data__;
                    let has_properties = "properties" in mark.__data__;
                    let has_data = "data" in mark.__data__;
                
                    var iterable = has_datum ? mark.__data__.datum : 
                        has_properties ? mark.__data__.properties :
                        has_data ? mark.__data__.data : mark.__data__;
                } else {
                    let mark_x = (mark.getBoundingClientRect().left + mark.getBoundingClientRect().right) / 2
                        - SVG.state().x_axis.ticks[0]['ticks'][0].parentNode._global_transform[0]
                        - SVG.state().svg.getBoundingClientRect().left;
                    let mark_y = (mark.getBoundingClientRect().top + mark.getBoundingClientRect().bottom) / 2
                        - SVG.state().y_axis.ticks[0]['ticks'][0].parentNode._global_transform[1]
                        - SVG.state().svg.getBoundingClientRect().top;

                    var iterable = {
                        [state.titles.x.innerHTML]: state.x_axis.scale.invert(mark_x).toFixed(2),
                        [state.titles.y.innerHTML]: state.y_axis.scale.invert(mark_y).toFixed(2)
                    }
                }
                mark.style['pointer-events'] = 'fill';
                
                mark.__inferred__data__ = iterable;
            }
        }

        return SVG;
    }

    SVG.state = function() { return state; }

    SVG.updateBrush = function() {
        select.updateBrush(SVG);
    }

    SVG.disambiguate = function(interaction, hide=false) {
        return;
        let pan_elem = document.getElementById("pan_mode");
        let brush_elem = document.getElementById("brush_mode");
        if (hide) {
            pan_elem.style['display'] = brush_elem.style['display'] = 'none';
            return;
        }

        pan_elem.style['display'] = brush_elem.style['display'] = 'block';
        switch(interaction) {
            case "pan":
                state.interactions.pan.flag = true;
                state.interactions.brush.flag = false;
                pan_elem.style['opacity'] =  1;
                brush_elem.style['opacity'] = 0.4;
                break;
            case "brush":
                state.interactions.pan.flag = false;
                state.interactions.brush.flag = true;
                pan_elem.style['opacity'] =  0.4;
                brush_elem.style['opacity'] = 1;
                break;
        }
    }

    // SVG.std = function() {
    //     if (state.svg_marks[0].nodeName === "path" && state.svg_marks[0].type !== "ellipse") return 1;

    //     let x = [], 
    //         y = [],
    //         x_mu = 0,
    //         x_std = 0,
    //         y_mu = 0,
    //         y_std = 0;
    //     for (const mark of state.svg_marks) {
    //         x_mu += +mark.getBoundingClientRect().left;
    //         y_mu += +mark.getBoundingClientRect().top
    //         x.push(+mark.getBoundingClientRect().left);
    //         y.push(+mark.getBoundingClientRect().top);
    //     }

    //     x_mu /= x.length;
    //     y_mu /= y.length;

    //     for (let i = 0; i < x.length; ++i) {
    //         x_std += (x[i] - x_mu) * (x[i] - x_mu);
    //         y_std += (y[i] - y_mu) * (y[i] - y_mu);
    //     }
    //     x_std = Math.sqrt(x_std / x.length);
    //     y_std = Math.sqrt(y_std / y.length);
        
    //     return x_std / y_std;
    // }

    SVG.filter = function(x, y, width, height) {
        document.getElementById("filter_mode").style['opacity'] = 1;
        document.getElementById("filter_mode").style['display'] = 'block';

        for (const mark of state.svg_marks) {
            if ((mark.type === "line" || mark.type === "polygon") && state.x_axis.ticks.length && state.y_axis.ticks.length) {
                state.interactions.brush.active = true;
                select.applyBrush(SVG, x, y, width, height);
                return;
            }
            
            if (state.x_axis.ordinal.length || (!state.x_axis.ticks.length && !state.y_axis.ticks.length)) {
                var brush_x_start = x;
                var brush_x_end = x + +width;
                var brush_y_end = y + +height;
                var brush_y_start = y;
    
                let bb = mark.getBoundingClientRect();
                var data_x = (+bb.left + +bb.right) / 2;
                var data_y = (+bb.top + +bb.bottom) / 2;
            } else {
                var brush_x_start = state.x_axis.scale.invert(x);
                var brush_x_end = state.x_axis.scale.invert(x + +width);
                var brush_y_end = state.y_axis.scale.invert(y);
                var brush_y_start = state.y_axis.scale.invert(y + +height);
    
                let bb = mark.getBoundingClientRect();
                var data_x = (state.x_axis.scale.invert(+bb.left) + state.x_axis.scale.invert(+bb.right)) / 2;
                var data_y = (state.y_axis.scale.invert(+bb.top) + state.y_axis.scale.invert(+bb.bottom)) / 2;
            }

            if (data_x < brush_x_start || data_x > brush_x_end || data_y < brush_y_start || data_y > brush_y_end) {
                mark.setAttribute("opacity", 0.25);
            } else {
                mark.setAttribute("opacity", 1);
            }
        }
    }

    SVG.unfilter = function() {
        state.interactions.brush.active = false;
        document.getElementById("filter_mode").style['display'] = 'none';
        for (const mark of state.svg_marks) {
            mark.setAttribute("opacity", 1);
        }
    }

    SVG.analyze_axes = function() {
        group_axis(state.x_axis, 'left');
        group_axis(state.y_axis, 'top');
        group_labels();
        group_legend();

        return SVG;
    }

    SVG.infer_view = function() {
        compute_domain(state.x_axis);
        compute_domain(state.y_axis);

        const width = +state.svg.getAttribute("width");
        const height = +state.svg.getAttribute("height");

        if (!state.x_axis.ticks.length && !state.y_axis.ticks.length) {
            state.x_axis.range = state.x_axis.global_range = [0, width];
            state.y_axis.range = state.y_axis.global_range = [height, 0];
            return SVG;
        }
        
        // TO-DO: Domain path 0.5 difference.
        if (state.has_domain) {
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
        let diff_2_x = +state.x_axis.ticks[2]['label'].innerHTML - +state.x_axis.ticks[1]['label'].innerHTML;

        let diff_tick_a = state.x_axis.ticks[1]['ticks'][0].getBoundingClientRect().left - 
            state.x_axis.ticks[0]['ticks'][0].getBoundingClientRect().left;
        let diff_tick_b = state.x_axis.ticks[2]['ticks'][0].getBoundingClientRect().left - 
            state.x_axis.ticks[1]['ticks'][0].getBoundingClientRect().left;

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
        return SVG;
    }

    return SVG;
}
