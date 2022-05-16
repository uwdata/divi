import { Tick } from "../state/constants";
import { min, max } from 'd3-array';

export function groupLabels(state) {
    for (let i = 0; i < state.axisTextMarks.length; ++i) {
        let xOffset = (state.axisTextMarks[i].clientRect.left + state.axisTextMarks[i].clientRect.right) / 2;
        let yOffset = (state.axisTextMarks[i].clientRect.top + state.axisTextMarks[i].clientRect.bottom) / 2;

        let xMin = 0, yMin = 0;
        for (let j = 0; j < state.xAxis.ticks.length; ++j) {
            if (Math.abs(xOffset - state.xAxis.ticks[j]['offset']) < Math.abs(xOffset - state.xAxis.ticks[xMin]['offset'])) {
                xMin = j;
            }
        }
        
        for (let j = 0; j < state.yAxis.ticks.length; ++j) {
            if (Math.abs(yOffset - state.yAxis.ticks[j]['offset']) < Math.abs(yOffset - state.yAxis.ticks[yMin]['offset'])) {
                yMin = j;
            }
        }

        Math.abs(xOffset - state.xAxis.ticks[xMin]['offset']) < Math.abs(yOffset - state.yAxis.ticks[yMin]['offset']) ? 
        state.xAxis.ticks[xMin]['label'] = state.axisTextMarks[i] :
        state.yAxis.ticks[yMin]['label'] = state.axisTextMarks[i];

        state.axisTextMarks[i].setAttribute('class', Tick);
    }
}

export function groupAxis(axis, index) {
    let positionMap = { };

    for (let i = 0; i < axis.ticks.length; ++i) {
        let offset = axis.ticks[i].clientRect[index];
        axis.ticks[i].setAttribute('class', (index === 'left' ? 'x-axis' : 'y-axis') + ' tick');

        offset in positionMap 
        ? positionMap[offset]['ticks'].push(axis.ticks[i]) 
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
        : isNaN(parseInt(value['label'].innerHTML)) 
        ? value['label'].innerHTML
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
