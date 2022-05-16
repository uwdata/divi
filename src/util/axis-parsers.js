import { Tick } from "../state/constants";
import { min, max } from 'd3-array';
import { axisBottom, axisLeft } from '../_d3/axis';

const epsilon = 5;

export function groupLabels(state) {
    function offset(tick, text) {
        if (!text) return Number.MAX_VALUE;

        const axis = tick['ticks'][0].className.baseVal;
        const xOffset = Math.abs((text.clientRect.left + text.clientRect.right) / 2 - tick['offset']);
        const yOffset = Math.abs((text.clientRect.top + text.clientRect.bottom) / 2 - tick['offset']);

        return axis.includes('x-axis') ? xOffset : yOffset;
    }

    const axes = [state.xAxis, state.yAxis];
    for (const axis of axes) {
        const ticks = axis.ticks;

        for (const tick of ticks) {
            for (const axisTextMark of state.axisTextMarks) {
                const currOffset = offset(tick, tick['label']);
                const newOffset = offset(tick, axisTextMark);

                if (newOffset < currOffset) {
                    const axis = tick['ticks'][0].className.baseVal;
                    const tie = Math.abs(newOffset - currOffset) < epsilon && tick['label']
                    ? axis.includes('x-axis') ? tick['label'].clientRect.top - axisTextMark.clientRect.top
                    : axisTextMark.clientRect.left - tick['label'].clientRect.left
                    : 1; 

                    if (tie > 0) tick['label'] = axisTextMark;
                }
            }

            tick['label'].tick = true;
        }
    }

    state.axisTextMarks.filter(textMark => !textMark.tick).map(textMark => state.textMarks.push(textMark));
    state.axisTextMarks = state.axisTextMarks.filter(textMark => textMark.tick);
}

export function groupAxis(axis, index) {
    let positionMap = { };

    for (let i = 0; i < axis.ticks.length; ++i) {
        let offset = axis.ticks[i].clientRect[index];
        axis.ticks[i].setAttribute('class', (index === 'left' ? 'x-axis' : 'y-axis') + ' tick');

        offset in positionMap ? positionMap[offset]['ticks'].push(axis.ticks[i]) 
        : positionMap[offset] = { 'label': null, 'ticks': [axis.ticks[i]] };
    }

    axis.ticks = [];
    for (const [key, value] of Object.entries(positionMap)) {
        value['offset'] = +key;
        axis.ticks.push(value);
    }

    axis.ticks.sort((first, second) => +first['offset'] < +second['offset'] ? -1 : (+first['offset'] > +second['offset'] ? 1 : 0))
}

export function computeDomain(axis) {
    for (const [_, value] of Object.entries(axis.ticks)) {
        let formatVal = value['label'].__data__ || +value['label'].__data__ === 0 
        ? value['label'].__data__ 
        : isNaN(parseInt(value['label'].innerHTML)) ? value['label'].innerHTML
        : +(value['label'].innerHTML.replace(/,/g, ''));

        if (typeof formatVal === "string") {
            axis.ordinal.push(formatVal);
        } else {
            axis.domain[0] = axis.domain[0] === null ? formatVal : min([axis.domain[0], formatVal]);
            axis.domain[1] = axis.domain[1] === null ? formatVal : max([axis.domain[1], formatVal]);
        }
    }
}

export function configureAxes(state) {
    if (state.xAxis.scale && !state.xAxis.ordinal.length) {
        // Infer original X-axis domain
        let tickLeft = state.xAxis.ticks[0]['ticks'][0].globalPosition['translate'][0];
        let tickRight = state.xAxis.ticks[state.xAxis.ticks.length - 1]['ticks'][0].globalPosition['translate'][0];
        
        // tickLeft = +(tickLeft.hasAttribute("transform") ? tickLeft.getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[0] : tick_left._global_transform[0] - SVG.state().x_axis.global_range[0]);
        // tickRight = +(tickRight.hasAttribute("transform") ? tickRight.getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[0] : tick_right._global_transform[0] - SVG.state().x_axis.global_range[0]);

        let newDomainX = state.xAxis.range.map(
            state.xAxis.scale.copy().range([tickLeft, tickRight]).invert, state.xAxis.scale
        );
        
        state.xAxis.scale.domain(newDomainX);
    }

    // TO-DO: Fix transform bug.
    if (state.yAxis.scale && !state.yAxis.ordinal.length) {
        // Infer original Y-axis domain
        let tickBottom = state.yAxis.ticks[0]['ticks'][0].globalPosition['translate'][1];
        let tickTop = state.yAxis.ticks[state.yAxis.ticks.length - 1]['ticks'][0].globalPosition['translate'][1];

        // tickBottom = +(tickBottom.hasAttribute("transform") ? tickBottom.getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[1] : tick_bottom._global_transform[1] - SVG.state().y_axis.global_range[1]);
        // tickTop = +(tickTop.hasAttribute("transform") ? tickTop.getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[1] : tick_top._global_transform[1] - SVG.state().y_axis.global_range[1]);
        // tick_bottom = SVG.state().y_axis.global_range[1];
        // tick_top = SVG.state().y_axis.global_range[0];

        let newDomainY = state.yAxis.range.map(
            state.yAxis.scale.copy().range([tickTop, tickBottom]).invert, state.yAxis.scale
        );
    
        state.yAxis.scale.domain(newDomainY);
    }
}

export function constructAxes() {
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
