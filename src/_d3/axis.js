import identity from './identity.js';
import { copyElement } from '../util/util.js';
import { Transform } from '../util/transform.js';

var top = 1,
    right = 2,
    bottom = 3,
    left = 4,
    epsilon = 1e-6;

function translateX(x, _y) {
  return "translate(" + x + "," + _y + ")";
}

function translateY(y, _x) {
  return "translate(" + _x + "," + y + ")";
}

function number(scale) {
  return d => +scale(d);
}

function center(scale, offset) {
  offset = Math.max(0, scale.bandwidth() - offset * 2) / 2;
  if (scale.round()) offset = Math.round(offset);
  return d => +scale(d) + offset;
}

function entering() {
  return !this.__axis;
}

function axis(orient, scale, state) {
  var tickArguments = [],
      tickValues = null,
      tickFormat = null,
      tickSizeInner = 6,
      tickSizeOuter = 6,
      tickPadding = 3,
      offset = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : 0.5,
      k = orient === top || orient === left ? -1 : 1,
      x = orient === left || orient === right ? "x" : "y",
      transform = orient === top || orient === bottom ? translateX : translateY,
      diff = null, 
      range_index = orient === top || orient === bottom ? 0 : 1,
      scale_transform = null,
      svgAxis = orient === top || orient === bottom ? state.xAxis : state.yAxis,
      ticks = svgAxis.ticks;

  function axis() {
    var values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues,
        format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity) : tickFormat,
        position = (scale.bandwidth ? center : number)(scale.copy(), offset)
    values = orient === left || orient === right ? values.reverse() : values;

    // function ordinalTransform(element, transform) {
    //     const global_position =
    //       element.getBoundingClientRect().right - element.parentElement._global_transform[0] - SVG.state().svg.getBoundingClientRect().left;
        
    //     if (!element._t) element._t = [global_position, 
    //       element.hasAttribute("transform") ? +element.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[0] : global_position];
    //     let new_pos = transform.applyX(element._t[0]);

    //     new_pos < svg_axis.range[0] || new_pos > svg_axis.range[1] ? 
    //       element.style.display = "none" : element.style.display = "block";

    //     return (new_pos - element._t[0]) + element._t[1];
    // }

    function updateTick(tick, value) {
      const label = tick.label;
      const tickMarks = tick.marks;

      label.innerHTML = svgAxis.ordinal.length || label.innerHTML === format(value) ? label.innerHTML : format(value);

      // const offset_label = label.hasAttribute("transform") ?
      //   (orient === top || orient === bottom ? 
      //     label.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[1] :
      //     label.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[0]) :
      //   0;

      // let text_anchor = label.hasAttribute("transform") ?
      //   (orient === top || orient === bottom ? 
      //     label.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[0] :
      //     label.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[1]) :
      //   (orient === top || orient === bottom ? 
      //     label._global_transform[0] :
      //     label._global_transform[1]);;
      // diff = diff == null ? +text_anchor - position(value) : diff;

      // if (scale_transform) {
      //   var label_t = transform(ordinal_transform(label, scale_transform), +Math.abs(offset_label) > 1e-2 ? +offset_label : 0);
      // } else {
      //   var label_t = transform(position(value) + (Math.abs(diff) < 5 ? diff : 0) + svg_axis.global_range[range_index] - label._global_transform[range_index], +Math.abs(offset_label) > 1e-2 ? +offset_label : 0);
      // }

      // let rotate = label.hasAttribute("transform") && label.getAttribute("transform").includes("rotate") ? +label.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g).pop() : null;
      if (label.clientRect) {
        const lx = label.clientRect.left + label.clientRect.width / 2 - state.svg.clientRect.left;
        const ly = label.clientRect.top + label.clientRect.height / 2 - state.svg.clientRect.top;
  
        const translateX = orient === bottom ? position(value) - lx : 0;
        const translateY = orient === left ? position(value) - ly : 0; 
  
        label.setAttribute('transform', label.localTransform.getTransform(new Transform(translateX, translateY)));
      }
      
      for (const mark of tickMarks) {
        // let offset_mark = mark.hasAttribute("transform") ?
        // (orient === top || orient === bottom ? 
        //   mark.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[1] :
        //   mark.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[0]) :
        // 0;

        // if (scale_transform) {
        //   var mark_t = transform(ordinal_transform(label, scale_transform), +Math.abs(offset_label) > 1e-2 ? +offset_label : 0);
        // } else {
        //   var mark_t = transform(position(value) + svg_axis.global_range[range_index] - label._global_transform[range_index], +Math.abs(offset_mark) > 1e-2 ? +offset_mark : 0);
        // }
        if (!mark.clientRect) continue;
        const tx = mark.clientRect.left + mark.clientRect.width / 2 - state.svg.clientRect.left;
        const ty = mark.clientRect.top + mark.clientRect.height / 2 - state.svg.clientRect.top;

        const translateX = orient === bottom ? position(value) - tx : 0;
        const translateY = orient === left ? position(value) - ty : 0; 
        if (translateY) console.log([value, position(value)])
        // if (!mark.localTransform) continue;
        mark.setAttribute('transform', mark.localTransform.getTransform(new Transform(translateX, translateY)));
      }
    }

    for (var counter = 0; counter < values.length && counter < ticks.length; ++counter) {
      updateTick(ticks[counter], svgAxis.ordinal.length ? svgAxis.ordinal[counter] : values[counter]);
    }

    for ( ; counter < values.length; ++counter) {
      let newTick = { 
        'label': copyElement(ticks[0].label), 
        'marks': ticks[0].marks.map(tick => copyElement(tick)), 
        'offset': null
      };

      updateTick(newTick, values[counter]);
      ticks[0].label.parentElement.appendChild(newTick.label);
      ticks[0].marks.forEach((d, i) => d.parentElement.insertBefore(newTick.marks[i], d));
      ticks.push(newTick);
    }

    const length = ticks.length;
    for ( ; counter < length; ++counter) {
      const pos = ticks.length - 1;
      if (ticks[pos].label) ticks[pos].label.remove();
      ticks[pos].marks.forEach(d => d.remove());
      ticks.pop();
    }
  }

  axis.applyTransform = function(_) {
    return arguments.length ? (scale_transform = _, axis) : axis; 
  }

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
