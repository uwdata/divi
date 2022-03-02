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

function axis(orient, scale, ticks) {
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
      diff = null;

  function axis() {
    var values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues,
        position = (scale.bandwidth ? center : number)(scale.copy(), offset)
    values = orient === left || orient === right ? values.reverse() : values;

    function update_tick (tick, value) {
      let label = tick['label'];
      let tick_marks = tick['ticks'];

      label.innerHTML = value;
      let offset_label = label.hasAttribute("transform") ?
        (orient === top || orient === bottom ? 
          label.getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[1] :
          label.getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[0]) :
        0;

      let text_anchor = label.hasAttribute("transform") ?
        (orient === top || orient === bottom ? 
          label.getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[0] :
          label.getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[1]) :
        0;
      diff = diff == null ? +text_anchor - position(value) : diff;

      label.setAttribute("transform", transform(position(value) + (Math.abs(diff) < 5 ? diff : 0), +offset_label));

      for (const mark of tick_marks) {
        let offset_mark = mark.hasAttribute("transform") ?
        (orient === top || orient === bottom ? 
          mark.getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[1] :
          mark.getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[0]) :
        0;
        mark.setAttribute("transform", transform(position(values[counter]), +offset_mark));
      }
    }

    for (var counter = 0; counter < values.length && counter < ticks.length; ++counter) {
      update_tick(ticks[counter], values[counter]);
    }

    for ( ; counter < values.length; ++counter) {
      let new_tick = { 
        'label': ticks[0]['label'].cloneNode(), 
        'ticks': ticks[0]['ticks'].map(d => d.cloneNode()), 
        'offset': null
      };

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

export function axisTop(scale, ticks) {
  return axis(top, scale, ticks);
}

export function axisRight(scale, ticks) {
  return axis(right, scale, ticks);
}

export function axisBottom(scale, ticks) {
  return axis(bottom, scale, ticks);
}

export function axisLeft(scale, ticks) {
  return axis(left, scale, ticks);
}
