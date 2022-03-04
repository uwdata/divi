import { format } from 'd3';
import { zoom } from './zoom.js';
import { brush } from './brush.js';
import { filter } from './filter.js';
import { sort } from './sort.js';
import { select } from './select.js';
import { min, max } from 'd3-array';
import { INTERACTION_CONSTANTS } from './constants';
import { axisBottom, axisLeft } from './d3/axis';

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
                control: null
            },
            zoom: {
                control: null,
                axis_control: null
            },
            pan: {
                control: null,
                axis_control: null
            },
            brush: {
                control: null,
                axis_control: null
            },
            filter: {
                control: null,
            },
            sort: {
                control: null
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

    var compute_domain = function(axis) {
        for (const [_, value] of Object.entries(axis.ticks)) {
            let format_val = value['label'].__data__ ? 
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
        for (const [key, value] of Object.entries(state.interactions)) {
            switch(key) {
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.SELECTION:
                    select(SVG, value.control);
                    break;
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.ZOOM:
                    zoom(SVG, value.control, value.axis_control);
                    break;
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.PAN:
                    break;
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.BRUSH:
                    brush(SVG, value.control, value.axis_control);
                    break;
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.FILTER:
                    filter(SVG, value.control);
            }
        }
    }

    SVG.infer_mark_attributes = function() { 
        for (const mark of state.svg_marks) {
            if (state.text_marks.length) {
                let title_pos_1 = state.text_marks[0].getBoundingClientRect().left;
                let title_pos_2 = state.text_marks[1].getBoundingClientRect().left;
                state.titles.x = title_pos_1 < title_pos_2 ? state.text_marks[1] : state.text_marks[0];
                state.titles.y = title_pos_1 < title_pos_2 ? state.text_marks[0] : state.text_marks[1];   
            }

            if (mark.nodeName !== "path" || (!state.x_axis.ticks.length && !state.y_axis.ticks.length) || (mark.nodeName === "path" && mark.type === "ellipse")) {
                if (mark.__data__) {
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

    SVG.filter = function(x, y, width, height) {
        for (const mark of state.svg_marks) {
            if (+mark.getBoundingClientRect().right < x ||
                +mark.getBoundingClientRect().left > x + +width ||
                +mark.getBoundingClientRect().bottom < y ||
                +mark.getBoundingClientRect().top > y + +height) {

                mark.setAttribute("opacity", 0.25);
            } else {
                mark.setAttribute("opacity", 1);
            }
        }
    }

    SVG.unfilter = function() {
        for (const mark of state.svg_marks) {
            mark.setAttribute("opacity", 1);
        }
    }

    SVG.analyze_axes = function() {
        group_axis(state.x_axis, 'left');
        group_axis(state.y_axis, 'top');
        group_labels();

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

            var x_min = y_tick.left - state.svg.getBoundingClientRect().left;
            var x_max = d3.min([y_tick.width + x_min, width]);
    
            var y_max = x_tick.bottom - state.svg.getBoundingClientRect().top;
            var y_min = d3.max([y_max - x_tick.height, 0]);
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
                .range(state.x_axis.range);
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
                .ticks(state.y_axis.ticks.length);
            // state.y_axis.axis(state.y_axis.ticks);
                // .tickSize(-state.y_axis.ticks[1].children[0].getAttribute("x2"))
                // .ticks(typeof state.y_axis.ticks[0].__data__ === "string" ? state.y_axis.ordinal.length : state.y_axis.ticks.length);
        }

        configure_axes();
        return SVG;
    }

    return SVG;
}
