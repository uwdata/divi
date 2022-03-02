import { min, max } from 'd3-array';
import { axisBottom, axisLeft } from './d3/axis';

export default function() {
    var state = {
        has_domain: false,
        svg: null,
        svg_marks: [],
        axis_text_marks: [],
        x_axis: {
            domain: [null, null],
            ordinal: [],
            range: [null, null],
            ticks: [],
            scale: null,
            axis: null
        },
        y_axis: {
            domain: [null, null],
            ordinal: [],
            range: [null, null],
            ticks: [],
            scale: null,
            axis: null
        },
        legend: [],
        titles: {
            x: null,
            y: null
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
            axis.domain[0] = axis.domain[0] === null ? +value['label'].innerHTML : Math.min(axis.domain[0], +value['label'].innerHTML);
            axis.domain[1] = axis.domain[1] === null ? +value['label'].innerHTML : Math.max(axis.domain[1], +value['label'].innerHTML);
        }
    }

    function SVG() { }

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
    }

    SVG.infer_view = function() {
        compute_domain(state.x_axis);
        compute_domain(state.y_axis);

        const width = +state.svg.getAttribute("width");
        const height = +state.svg.getAttribute("height");

        if (!state.x_axis.ticks.length && !state.y_axis.ticks.length) {
            state.x_axis.range = [0, width];
            state.y_axis.range = [height, 0];
            return;
        }
        
        if (state.has_domain) {
            let axes = [].slice.call(svg.querySelectorAll(".domain")).map((d) => { return d.getBoundingClientRect() });
            let y_axis = axes[0].width < axes[1].width ? axes[0] : axes[1];
            let x_axis = axes[0].height < axes[1].height ? axes[0] : axes[1];

            var x_min = x_axis.left - state.svg.getBoundingClientRect().left;
            var x_max = x_axis.right - state.svg.getBoundingClientRect().left;
    
            var y_max = y_axis.bottom - state.svg.getBoundingClientRect().top;
            var y_min = y_axis.top - state.svg.getBoundingClientRect().top;
        }
        else {
            let y_tick = state.y_axis.ticks[0]['ticks'][0].getBoundingClientRect();
            let x_tick = state.x_axis.ticks[0]['ticks'][0].getBoundingClientRect();

            var x_min = y_tick.left - state.svg.getBoundingClientRect().left;
            var x_max = d3.min([y_tick.width + x_min, width]);
    
            var y_max = x_tick.bottom - state.svg.getBoundingClientRect().top;
            var y_min = d3.max([y_max - x_tick.height, 0]);
        }

        state.x_axis.range = [x_min, x_max].map(d => d - state.x_axis.ticks[0]['ticks'][0]._global_transform[0]);
        state.y_axis.range = [y_max, y_min].map(d => d - state.y_axis.ticks[0]['ticks'][0]._global_transform[1]);

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
            state.x_axis.axis = d3.axisBottom(state.x_axis.scale)
                .tickSize(state.x_axis.ticks[1].children[0].getAttribute("y2"))
                .ticks(state.x_axis.ticks.filter(d => d.childNodes[1].innerHTML).length)
            if (base) {
                state.x_axis.scale = state.x_axis.scale.base(base);
                state.x_axis.axis = state.x_axis.axis.tickFormat(d => exponent || superscript ? format(d) : d);
            }
        } else {
            state.x_axis.scale = (state.x_axis.domain[0] instanceof Date ? d3.scaleTime() : (state.x_axis.ordinal.length ? d3.scaleBand() : d3.scaleLinear()))
                .domain(typeof state.x_axis.ticks[0]['label'] === "string" ? state.x_axis.ordinal : state.x_axis.domain)
                .range(state.x_axis.range);
            state.x_axis.axis = axisBottom(state.x_axis.scale, state.x_axis.ticks)
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
                .domain(typeof state.y_axis.ticks[0]['label'] === "string" ? state.y_axis.ordinal : state.y_axis.domain)
                .range(state.y_axis.range);
            state.y_axis.axis = axisLeft(state.y_axis.scale, state.y_axis.ticks)
                .ticks(state.y_axis.ticks.length);
            // state.y_axis.axis(state.y_axis.ticks);
                // .tickSize(-state.y_axis.ticks[1].children[0].getAttribute("x2"))
                // .ticks(typeof state.y_axis.ticks[0].__data__ === "string" ? state.y_axis.ordinal.length : state.y_axis.ticks.length);
        }
    }

    return SVG;
}
