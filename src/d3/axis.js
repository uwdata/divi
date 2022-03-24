import { svg } from "d3";
import identity from "./identity.js";

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

function axis(orient, scale, SVG) {
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
      svg_axis = orient === top || orient === bottom ? SVG.state().x_axis : SVG.state().y_axis,
      ticks = svg_axis.ticks;

  function axis() {
    var values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues,
        format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity) : tickFormat,
        position = (scale.bandwidth ? center : number)(scale.copy(), offset)
    values = orient === left || orient === right ? values.reverse() : values;

    function ordinal_transform(element, transform) {
        const global_position =
          element.getBoundingClientRect().right - element.parentElement._global_transform[0] - SVG.state().svg.getBoundingClientRect().left;

        if (!element._t) element._t = [global_position, +element.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[0]];
        let new_pos = transform.applyX(element._t[0]);

        new_pos < svg_axis.range[0] || new_pos > svg_axis.range[1] ? 
          element.style.display = "none" : element.style.display = "block";

        return (new_pos - element._t[0]) + element._t[1];
    }

    function update_tick(tick, value) {
      let label = tick['label'];
      let tick_marks = tick['ticks'];

      label.innerHTML = svg_axis.ordinal.length || label.innerHTML == format(value) ? label.innerHTML : format(value);

      let offset_label = label.hasAttribute("transform") ?
        (orient === top || orient === bottom ? 
          label.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[1] :
          label.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[0]) :
        0;

      let text_anchor = label.hasAttribute("transform") ?
        (orient === top || orient === bottom ? 
          label.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[0] :
          label.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[1]) :
        (orient === top || orient === bottom ? 
          label._global_transform[0] :
          label._global_transform[1]);;
      diff = diff == null ? +text_anchor - position(value) : diff;

      if (scale_transform) {
        var label_t = transform(ordinal_transform(label, scale_transform), +Math.abs(offset_label) > 1e-2 ? +offset_label : 0);
      } else {
        var label_t = transform(position(value) + (Math.abs(diff) < 5 ? diff : 0) + svg_axis.global_range[range_index] - label._global_transform[range_index], +Math.abs(offset_label) > 1e-2 ? +offset_label : 0);
      }

      let rotate = label.hasAttribute("transform") && label.getAttribute("transform").includes("rotate") ? +label.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g).pop() : null;
      label.setAttribute("transform", label_t + (rotate ? " rotate(" + rotate + ")" : ""));
      
      for (const mark of tick_marks) {
        let offset_mark = mark.hasAttribute("transform") ?
        (orient === top || orient === bottom ? 
          mark.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[1] :
          mark.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[0]) :
        0;

        if (scale_transform) {
          var mark_t = transform(ordinal_transform(label, scale_transform), +Math.abs(offset_label) > 1e-2 ? +offset_label : 0);
        } else {
          var mark_t = transform(position(value) + svg_axis.global_range[range_index] - label._global_transform[range_index], +Math.abs(offset_mark) > 1e-2 ? +offset_mark : 0);
        }
        mark.setAttribute("transform", mark_t);
      }
    }

    for (var counter = 0; counter < values.length && counter < ticks.length; ++counter) {
      update_tick(ticks[counter], svg_axis.ordinal.length ? svg_axis.ordinal[counter] : values[counter]);
    }

    for ( ; counter < values.length; ++counter) {
      let new_tick = { 
        'label': ticks[0]['label'].cloneNode(), 
        'ticks': ticks[0]['ticks'].map(d => { let e = d.cloneNode(); e._global_transform = d._global_transform; return e; }), 
        'offset': null
      };
      new_tick['label']._global_transform = ticks[0]['label']._global_transform;

      update_tick(new_tick, values[counter]);
      ticks[0]['label'].parentElement.appendChild(new_tick['label']);
      ticks[0]['ticks'].forEach((d, i) => d.parentElement.appendChild(new_tick['ticks'][i]));
      ticks.push(new_tick);
    }

    let l = ticks.length;
    for (let i = 0; counter < l; ++counter) {
      let pos = ticks.length - 1 - i;
      ticks[pos]['label'].remove();
      ticks[pos]['ticks'].forEach(d => d.remove());
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
