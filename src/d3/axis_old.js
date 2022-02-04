import identity from "./identity.js";

var top = 1,
    right = 2,
    bottom = 3,
    left = 4,
    epsilon = 1e-6;

function translateX(x) {
  return "translate(" + x + ",0)";
}

function translateY(y) {
  return "translate(0," + y + ")";
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

function axis(orient, scale) {
  var tickArguments = [],
      tickValues = null,
      tickFormat = null,
      tickSizeInner = 6,
      tickSizeOuter = 6,
      tickPadding = 3,
      transform_cb = null,
      offset = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : 0.5,
      k = orient === top || orient === left ? -1 : 1,
      x = orient === left || orient === right ? "x" : "y",
      transform = orient === top || orient === bottom ? translateX : translateY;

  function axis(context) {
    // console.log(scale);
    var //values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues,
        //format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity) : tickFormat,
        //spacing = Math.max(tickSizeInner, 0) + tickPadding,
        // range = scale.range(),
        // range0 = +range[0] + offset,
        // range1 = +range[range.length - 1] + offset,
        // position = (scale.bandwidth ? center : number)(scale.copy(), offset),
        selection = context.selection ? context.selection() : context,
        path = selection.selectAll(".domain").data([null]),
        tick = selection.selectAll(".tick"), //.data(values, scale).order(),
        tickExit = tick.exit(),
        tickEnter = tick.enter().append("g").attr("class", "tick"),
        line = tick.select("line"),
        text = tick.select("text");
    // path = path.merge(path.enter().insert("path", ".tick")
    //     .attr("class", "domain")
    //     .attr("stroke", "currentColor"));

    tick = tick.merge(tickEnter);

    // line = line.merge(tickEnter.append("line")
    //     .attr("stroke", "currentColor")
    //     .attr(x + "2", k * tickSizeInner));

    // text = text.merge(tickEnter.append("text")
    //     .attr("fill", "currentColor")
    //     .attr(x, k * spacing)
    //     .attr("dy", orient === top ? "0em" : orient === bottom ? "0.71em" : "0.32em"));
    // console.log(scale);
    if (context !== selection) {
      path = path.transition(context);
      tick = tick.transition(context);
      line = line.transition(context);
      text = text.transition(context);

      tickExit = tickExit.transition(context)
          .attr("opacity", epsilon)
          .attr("transform", function(d) { return isFinite(d = position(d)) ? transform(d + offset) : this.getAttribute("transform"); });

      tickEnter
          .attr("opacity", epsilon)
          .attr("transform", function(d) { var p = this.parentNode.__axis; return transform((p && isFinite(p = p(d)) ? p : position(d)) + offset); });
    }
    
    tickExit.remove();
    // path
    //     .attr("d", orient === left || orient === right
    //         ? (tickSizeOuter ? "M" + k * tickSizeOuter + "," + range0 + "H" + offset + "V" + range1 + "H" + k * tickSizeOuter : "M" + offset + "," + range0 + "V" + range1)
    //         : (tickSizeOuter ? "M" + range0 + "," + k * tickSizeOuter + "V" + offset + "H" + range1 + "V" + k * tickSizeOuter : "M" + range0 + "," + offset + "H" + range1));

    tick
        .attr("opacity", 1)
        // .attr("transform", function(d) { return transform(position(d)); });
        // .attr("transform", function(d) { return transform( + offset); } )
    tick.nodes().forEach((el) => {
        // console.log(el.getAttribute("transform"));
        // console.log(val);
        // console.log(offset);
        let x = transform_cb ? (orient === top || orient === bottom ? transform_cb.x : transform_cb.y) : 0;
        let k = transform_cb ? transform_cb.k : 1;
        if (transform_cb == null) {
            return;
        }
        // console.log((+el.__pos__ - x) * k);
        // console.log(x * k);
        // console.log((700 + x) * k);
        // console.log('');
        let range = [0, 670];
        // if (transform_cb == null) {
        //     return;
        // }
        let new_range = range.map(function(d) {
            let tmp = (orient === top || orient === bottom ? transform_cb.x : transform_cb.y);
            return (d - tmp) / transform_cb.k;
        });
        // let scale_fac = (720 - 0) / (new_range[1] - new_range[0]);
        // console.log(k * scale_fac);
        console.log(new_range);
        let ctr = (new_range[1] + new_range[0]) / 2;
        console.log(ctr);
        // console.log(new_range);
        // console.log(new_range[1] - new_range[0])
        // console.log(ctr);
        let new_pos = (+el.__pos__ - ctr) * k + ctr + x * k;
        console.log(+el.__pos__);
        console.log(new_pos);
        console.log('');
        // el.setAttribute("transform", transform(new_pos));
        el.setAttribute("transform", transform(+el.__pos__ - x) + " scale(" + String(k) + ")");
        // console.log(el.getAttribute("transform"));
        // console.log("");
    });

    // line
    //     .attr(x + "2", k * tickSizeInner);

    // text
    //     .attr(x, k * spacing)
    //     .text(format);

//     selection.filter(entering)
//         .attr("fill", "none")
//         .attr("font-size", 10)
//         .attr("font-family", "sans-serif")
//         .attr("text-anchor", orient === right ? "start" : orient === left ? "end" : "middle");

//     selection
//         .each(function() { this.__axis = position; });
  }

  axis.transform_cb = function(_) {
      return arguments.length ? (transform_cb = _, axis) : transform_cb;
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

export function axisTop(scale) {
  return axis(top, scale);
}

export function axisRight(scale) {
  return axis(right, scale);
}

export function axisBottom(scale) {
  return axis(bottom, scale);
}

export function axisLeft(scale) {
  return axis(left, scale);
}
