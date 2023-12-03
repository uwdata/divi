import identity from './identity.js';
import { copyElement } from '../util/util.js';
import { Transform } from '../util/transform.js';

const top = 1;
const right = 2;
const bottom = 3;
const left = 4;

function number(scale) {
    return d => +scale(d);
}

function center(scale, offset) {
    offset = Math.max(0, scale.bandwidth() - offset * 2) / 2;
    if (scale.round()) offset = Math.round(offset);
    return d => +scale(d) + offset;
}

function axis(orient, scale, state) {
    let tickArguments = [];
    let tickValues = null;
    let tickFormat = null;
    let tickSizeInner = 6;
    let tickSizeOuter = 6;
    let tickPadding = 3;
    let offset = typeof window !== 'undefined' && window.devicePixelRatio > 1 ? 0 : 0.5;
    const svgAxis = orient === top || orient === bottom ? state.xAxis : state.yAxis;
    const ticks = svgAxis.ticks;

    function axis() {
        let values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues;
        const format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity) : tickFormat;
        const position = (scale.bandwidth ? center : number)(scale.copy(), offset);
        values = orient === left || orient === right ? values.reverse() : values;

        function updateTick(tick, value) {
            tick.value = value;
            const label = tick.label; const tickMarks = tick.marks;
            label.innerHTML = svgAxis.ordinal.length || label.value === format(value) ? label.value : format(value);

            const lx = label.globalPosition.translate.x; const ly = label.globalPosition.translate.y;
            const translateX = orient === bottom ? position(value) - lx : 0;
            const translateY = orient === left ? position(value) - ly : 0;
            label.setAttribute('transform', label.localTransform.getTransform(new Transform(translateX, translateY)));

            for (const mark of tickMarks) {
                const tx = mark.globalPosition.translate.x; const ty = mark.globalPosition.translate.y;
                const translateX = orient === bottom ? position(value) - tx : 0;
                const translateY = orient === left ? position(value) - ty : 0;

                mark.setAttribute('transform', mark.localTransform.getTransform(new Transform(translateX, translateY)));
            }
        }

        let counter;
        for (counter = 0; counter < values.length && counter < ticks.length; ++counter) {
            updateTick(ticks[counter], svgAxis.ordinal.length ? svgAxis.ordinal[counter] : values[counter]);
        }

        for (; counter < values.length; ++counter) {
            const newTick = {
                label: copyElement(ticks[0].label),
                marks: ticks[0].marks.map(tick => copyElement(tick)),
                value: 0
            };

            updateTick(newTick, values[counter]);
            ticks[0].label.parentElement.appendChild(newTick.label);
            ticks[0].marks.forEach((d, i) => d.parentElement.insertBefore(newTick.marks[i], d));
            ticks.push(newTick);
        }

        const length = ticks.length;
        for (; counter < length; ++counter) {
            const pos = ticks.length - 1;
            if (ticks[pos].label) ticks[pos].label.remove();
            ticks[pos].marks.forEach(d => d.remove());
            ticks.pop();
        }
    }

    axis.applyTransform = function(_) {
        return arguments.length ? (scale_transform = _, axis) : axis;
    };

    axis.scale = function(_) {
        return arguments.length ? (scale = _, axis) : scale;
    };

    axis.ticks = function() {
        return tickArguments = Array.from(arguments), axis;
    };

    axis.tickArguments = function(_) {
        return arguments.length ? (tickArguments = _ == null ? [] : Array.from(_), axis) : tickArguments.slice();
    };

    axis.tickValues = function(_) {
        return arguments.length ? (tickValues = _ == null ? null : Array.from(_), axis) : tickValues && tickValues.slice();
    };

    axis.tickFormat = function(_) {
        return arguments.length ? (tickFormat = _, axis) : tickFormat;
    };

    axis.tickSize = function(_) {
        return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis) : tickSizeInner;
    };

    axis.tickSizeInner = function(_) {
        return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
    };

    axis.tickSizeOuter = function(_) {
        return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
    };

    axis.tickPadding = function(_) {
        return arguments.length ? (tickPadding = +_, axis) : tickPadding;
    };

    axis.offset = function(_) {
        return arguments.length ? (offset = +_, axis) : offset;
    };

    return axis;
}

export function axisTop(scale, SVG) {
    return axis(top, scale, SVG);
}

export function axisRight(scale, SVG) {
    return axis(right, scale, SVG);
}

export function axisBottom(scale, SVG) {
    return axis(bottom, scale, SVG);
}

export function axisLeft(scale, SVG) {
    return axis(left, scale, SVG);
}
