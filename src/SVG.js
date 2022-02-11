import { min, max } from 'd3-array';

export default function() {
    var has_domain = false,
        svg = null,
        svg_marks = [],
        x_axis = {
            domain: [null, null],
            ordinal: [],
            range: [null, null],
            ticks: [],
            scale: null,
            axis: null
        },
        y_axis = {
            domain: [null, null],
            ordinal: [],
            range: [null, null],
            ticks: [],
            scale: null,
            axis: null
        };

    function SVG() { }

    SVG.set_domain = function(_domain) {
        has_domain = _domain;
    }

    SVG.has_domain = function() {
        return has_domain;
    }

    SVG.set_svg = function(_svg) {
        svg = _svg;
    }

    SVG.get_svg = function() {
        return svg;
    }

    SVG.add_svg_mark = function(_svg_mark) {
        svg_marks.push(_svg_mark);
    }

    SVG.get_svg_marks = function() {
        return svg_marks;
    }

    SVG.get_x_axis = function() {
        return x_axis.axis;
    }

    SVG.set_x_axis_domain = function(_x_axis_domain) { 
        x_axis.domain = _x_axis_domain;
    }

    SVG.get_x_axis_domain = function() { 
        return x_axis.domain;
    }

    SVG.get_x_axis_ticks = function() {
        return x_axis.ticks;
    }

    SVG.add_x_axis_tick = function(_x_axis_tick) {
        x_axis.ticks.push(_x_axis_tick);
    }

    SVG.get_x_scale = function() {
        return x_axis.scale;
    }

    SVG.set_x_scale = function(_x_scale) {
        x_axis.scale = _x_scale;
    }

    SVG.get_y_axis = function() {
        return y_axis.axis;
    }

    SVG.get_x_scale = function() {
        return x_axis.scale;
    }

    SVG.set_y_axis_domain = function(_y_axis_domain) { 
        y_axis.domain = _y_axis_domain;
    }

    SVG.set_y_scale = function(_y_scale) { 
        y_axis.scale = _y_scale;
    }

    SVG.get_x_axis_range = function() {
        return x_axis.range;
    }

    SVG.get_y_axis_domain = function() { 
        return y_axis.domain;
    }

    SVG.get_y_axis_ticks = function() {
        return y_axis.ticks;
    }

    SVG.add_y_axis_tick = function(_y_axis_tick) {
        y_axis.ticks.push(_y_axis_tick);
    }

    SVG.get_y_axis_range = function() {
        return y_axis.range;
    }

    SVG.get_y_scale = function() {
        return y_axis.scale;
    }

    SVG.add_x_ordinal = function(_x_ordinal) {
        x_axis.ordinal.push(_x_ordinal);
    }

    SVG.add_y_ordinal = function(_y_ordinal) {
        y_axis.ordinal.push(_y_ordinal);
    }

    SVG.infer_view = function() {
        const _svg = d3.select("#" + svg.id);
        const marks = _svg.selectAll('[__mark__="true"]');
        const width = parseInt(svg.getAttribute("width"));
        const height = parseInt(svg.getAttribute("height"));

        if (!x_axis.ticks.length && !y_axis.ticks.length) {
            x_axis.range = [0, width];
            y_axis.range = [height, 0];
            return;
        }

        if (has_domain) {
            let axes = [].slice.call(svg.querySelectorAll(".domain")).map((d) => { return d.getBoundingClientRect() });
            let y_axis = axes[0].width < axes[1].width ? axes[0] : axes[1];
            let x_axis = axes[0].height < axes[1].height ? axes[0] : axes[1];

            var x_min = x_axis.left - svg.getBoundingClientRect().left;
            var x_max = x_axis.right - svg.getBoundingClientRect().left;
    
            var y_max = y_axis.bottom - svg.getBoundingClientRect().top;
            var y_min = y_axis.top - svg.getBoundingClientRect().top;
        }
        else {
            let y_tick = y_axis.ticks[0].childNodes[0].getBoundingClientRect();
            let x_tick = x_axis.ticks[0].childNodes[0].getBoundingClientRect();

            var x_min = y_tick.left - svg.getBoundingClientRect().left;
            var x_max = d3.min([y_tick.width + x_min, width]);
    
            var y_max = x_tick.bottom - svg.getBoundingClientRect().top;
            var y_min = d3.max([y_max - x_tick.height, 0]);
        }

        x_axis.range = [x_min, x_max].map(d => d - x_axis.ticks[0]._global_transform[0]);
        y_axis.range = [y_max, y_min].map(d => d - y_axis.ticks[0]._global_transform[1]);

        // let x_tick_min = min(y_axis.ticks.map(function(el) {
        //     // return +el.getAttribute("transform").match(/(\d+\.?\d*)/g)[0];
        //     return +el.childNodes[0].getBoundingClientRect().left;
        // }));
        // let x_tick_max = max(y_axis.ticks.map(function(el) {
        //     // return +el.getAttribute("transform").match(/(\d+\.?\d*)/g)[0];
        //     return +el.childNodes[0].getBoundingClientRect().left;
        // }));
        // let y_tick_min = min(x_axis.ticks.map(function(el) {
        //     // return +el.getAttribute("transform").match(/(\d+\.?\d*)/g)[1];
        //     return +el.childNodes[0].getBoundingClientRect().left;
        // }));
        // let y_tick_max = max(x_axis.ticks.map(function(el) {
        //     // return +el.getAttribute("transform").match(/(\d+\.?\d*)/g)[1];
        //     return +el.childNodes[0].getBoundingClientRect().left;
        // }));

        let diff_1_y = y_axis.ticks[1].__data__ - y_axis.ticks[0].__data__;
        let diff_2_y = y_axis.ticks[2].__data__ - y_axis.ticks[1].__data__;
    
        let diff_1_x = x_axis.ticks[1].__data__ - x_axis.ticks[0].__data__;
        let diff_2_x = x_axis.ticks[2].__data__ - x_axis.ticks[1].__data__;

        if (Math.abs(diff_1_x - diff_2_x) > 5e-1) {
            let tick_diff_1 = x_axis.ticks[1].getBoundingClientRect().left - x_axis.ticks[0].getBoundingClientRect().left;
            let tick_diff_2 = x_axis.ticks[2].getBoundingClientRect().left - x_axis.ticks[1].getBoundingClientRect().left;

            if (Math.abs(tick_diff_1 - tick_diff_2) < 5e-1) {
                let format = x_axis.ticks[0].childNodes[1].innerHTML;
                if (format != x_axis.ticks[0].__data__ && typeof format === "string") { 
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

            x_axis.scale = d3.scaleLog()
                .base(base)
                .domain(x_axis.domain)
                .range(x_axis.range);
            x_axis.axis = d3.
                axisBottom(x_axis.scale)
                .tickSize(x_axis.ticks[1].children[0].getAttribute("y2"))
                .ticks(x_axis.ticks.length)
                .tickFormat(d => exponent || superscript ? format(d) : d);
        } else {
            x_axis.scale = (x_axis.domain[0] instanceof Date ? d3.scaleTime() : (x_axis.ordinal.length ? d3.scaleBand() : d3.scaleLinear()))
                .domain(typeof x_axis.ticks[0].__data__ === "string" ? x_axis.ordinal : x_axis.domain)
                .range(x_axis.range);
            x_axis.axis = d3.
                axisBottom(x_axis.scale)
                .tickSize(x_axis.ticks[1].children[0].getAttribute("y2"))
                .ticks(typeof x_axis.ticks[0].__data__ === "string" ? x_axis.ordinal.length : x_axis.ticks.length);
        }

        if (Math.abs(diff_1_y - diff_2_y) > 5e-1) {
            y_axis.scale = d3.scaleLog()
                .domain(y_axis.domain)
                .range(y_axis.range);
            y_axis.axis = d3.
                axisLeft(y_axis.scale)
                .tickSize(-y_axis.ticks[1].children[0].getAttribute("x2"))
                .ticks(y_axis.ticks.length);
        } else {
            y_axis.scale = (y_axis.domain[0] instanceof Date ? d3.scaleTime() : (y_axis.ordinal.length ? d3.scaleBand() : d3.scaleLinear()))
                .domain(typeof y_axis.ticks[0].__data__ === "string" ? y_axis.ordinal : y_axis.domain)
                .range(y_axis.range);
            y_axis.axis = d3.
                axisLeft(y_axis.scale)
                .tickSize(-y_axis.ticks[1].children[0].getAttribute("x2"))
                .ticks(typeof y_axis.ticks[0].__data__ === "string" ? y_axis.ordinal.length : y_axis.ticks.length);
        }
    }

    return SVG;
}
