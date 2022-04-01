import { INTERACTION_CONSTANTS } from "./constants";

function getFormattedDate(date) {
    var year = date.getFullYear();
  
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
  
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    
    return month + '/' + day + '/' + year;
  }  

function create_tooltip(id, c=null) {
    if (document.querySelector("#" + id)) return;

    const div = document.createElement("div");
    div.id = id;
    div.setAttribute("class", c ? c : "tooltip");
    div.style = "opacity:1; visibility:visible; position:absolute; background-color:white; z-index:999; " +
        "border:solid; border-width:1px; border-radius:2px; padding:2px; font-size:14px; font-weight:500; pointer-events:none;";
    document.body.insertBefore(div, null);
}

function line(SVG, event, mark, i, id=null, c=null) {
    if (!id && d3.selectAll(".brush_tooltip").nodes().length) return;

    let transform = mark.getAttribute('transform');
    let x_scale = 1, x_translate = 0;
    if (transform) {
        let t = transform.match(/(-?\d+\.?\d*)/g);
        x_translate = +t[0];
        x_scale = +t[2];
    }

    let offset = SVG.state().x_axis.ticks[0]['ticks'][0].parentNode._global_transform[0] 
        +SVG.state().svg.getBoundingClientRect().left,
        path_x = event.clientX - offset,
        start = SVG.state().x_axis.range[0], 
        end = mark.getTotalLength(),
        target, 
        pos;

    create_tooltip("tooltip" + (id ? id : ""), c);
    let tooltip = document.querySelector("#tooltip" + (id ? id : ""));
    // tooltip.style['visibility'] = 'visible';
    if (path_x < SVG.state().x_axis.range[0] || SVG.state().x_axis.range[1] < path_x) {
        d3.selectAll(".hover").attr("visibility", "hidden");
        if (tooltip) tooltip.style["visibility"] = "hidden";
    } else {
        d3.selectAll(".hover").attr("visibility", "visible");
        if (tooltip) tooltip.style["visibility"] = "visible";
    }
 
    path_x = (path_x - x_translate) / x_scale;
    while (true){
        target = Math.floor((start + end) / 2);
        pos = mark.getPointAtLength(target);
        if ((target === end || target === start) && pos.x !== path_x) {
            break;
        }

        if (pos.x > path_x) {
            end = target;
        } else if (pos.x < path_x) {
            start = target;
        } else {
            break; //position found
        }
    }

    let y = pos.y + SVG.state().y_axis.ticks[0]['ticks'][0].parentNode._global_transform[1];
    let y_domain = SVG.state().y_axis.scale.invert(
        y - SVG.state().y_axis.ticks[0]['ticks'][0].parentNode._global_transform[1]
    );
    let data_x = SVG.state().x_axis.scale.invert(path_x);
    data_x = typeof data_x === "number" ? Math.round(data_x) : getFormattedDate(data_x);

    // tooltip.innerHTML = (SVG.state().titles.x ? SVG.state().titles.x + ":" : "") + data_x + "<hr style='margin:0px;border:0.5px solid black;opacity:1;'>" + 
    //     (SVG.state().titles.y ? SVG.state().titles.y + ":" : "") + Math.round(y_domain);
    let color = mark.type === "line" ? window.getComputedStyle(mark)['stroke'] : window.getComputedStyle(mark)['fill'];
    if (i === 1) {
        tooltip.innerHTML = SVG.state().svg_marks.length === 1 ? Math.round(y_domain) :
            "<div><span class='dot' style='background-color:" + color + ";'></span>" +
            "<div style='display:inline;margin-right:20px;'> " + (mark.__data__.key ? mark.__data__.key : "") + "</div> " +
            "<div style='display:inline;float:right;'>" + Math.round(y_domain) + "</div></div>";
    } else {
        tooltip.innerHTML = SVG.state().svg_marks.length === 1 ? Math.round(y_domain) :
            "<div><span class='dot' style='background-color:" + color + ";'></span>" +
            "<div style='display:inline;margin-right:20px;'> " + (mark.__data__.key ? mark.__data__.key : "") + "</div> " +
            "<div style='display:inline;float:right;'>" + Math.round(y_domain) + "</div></div>" +
            tooltip.innerHTML;
    }
    
    d3.selectAll(".dot")
        .style("height", "10px")
        .style("width", "10px")
        // .style("background-color", "#bbb")
        .style("border-radius", "50%")
        .style("display", "inline-block");
    
    tooltip.style['color'] = mark.type === "line" ? window.getComputedStyle(mark)['stroke'] : "black";
    tooltip.style['left'] = event.pageX + 7.5;
    tooltip.style['top'] = /*SVG.state().svg.getBoundingClientRect().top + 10;*/
    event.pageY - event.clientY + y + 
        SVG.state().svg.getBoundingClientRect().top - 15;

    let circle = SVG.state().svg.querySelector("#_circle" + (id ? id : "") + i);
    if (circle) {
        circle.setAttribute("cx", (path_x * x_scale + x_translate) 
            + SVG.state().x_axis.ticks[0]['ticks'][0].parentNode._global_transform[0]);
        circle.setAttribute("cy", y);
        circle.setAttribute("display", "");
    } else {
        circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("r", 6);
        circle.setAttribute("fill", mark.type === "line" ? window.getComputedStyle(mark)['stroke'] : 
            window.getComputedStyle(mark)['fill']);
        circle.setAttribute("opacity", 0.75);
        circle.setAttribute("stroke", "black");
        // circle.setAttribute("stroke", window.getComputedStyle(mark)['fill']);
        circle.setAttribute("stroke-width", '1px');
        circle.id = "_circle" + (id ? id : "") + i;
        circle.setAttribute("class", c ? c : "hover");
        SVG.state().svg.append(circle);
        circle.setAttribute("cx", (path_x * x_scale + x_translate) 
            + SVG.state().x_axis.ticks[0]['ticks'][0].parentNode._global_transform[0]);
        circle.setAttribute("cy", y);
    }
    
    let line = SVG.state().svg.querySelector("#_hoverline" + (id ? id : ""));
    if (line) { 
        line.setAttribute("x1", event.clientX - SVG.state().svg.getBoundingClientRect().left);
        line.setAttribute("x2", event.clientX - SVG.state().svg.getBoundingClientRect().left);
        line.setAttribute("display", "");
        // line.setAttribute("visibility", "hidden");
    } else {
        line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-width", 1.5);
        line.setAttribute("opacity", "0.5");
        line.style['pointer-events'] = 'none';
        // line.setAttribute("visibility", "hidden");
        line.setAttribute("class", c ? c : "hover")
        line.setAttribute("y1", 
            SVG.state().y_axis.range[0] + SVG.state().y_axis.ticks[0]['ticks'][0].parentNode._global_transform[1]);
        line.setAttribute("y2", 
            SVG.state().y_axis.range[1] + SVG.state().y_axis.ticks[0]['ticks'][0].parentNode._global_transform[1]);
        line.setAttribute("x1", event.clientX - SVG.state().svg.getBoundingClientRect().left);
        line.setAttribute("x2", event.clientX - SVG.state().svg.getBoundingClientRect().left);
        line.id = "_hoverline" + (id ? id : "");
        SVG.state().svg.append(line);
    }
}


function create_hover(SVG, control) {
    function mouseleave() {
        SVG.state().interactions.brush.on_elem = false;
        let tooltip = document.querySelector("#tooltip");
        tooltip.style['visibility'] = 'hidden';
    }
    
    function highlight(event) {
        SVG.state().interactions.selection.active = true;

        if (event.target.hasAttribute("__legend__")) {
            let color = window.getComputedStyle(event.target).fill;
            for (const mark of SVG.state().svg_marks) {
                if (window.getComputedStyle(mark).fill != color) {
                    mark.setAttribute("opacity", 0.25);
                } else {
                    mark.setAttribute("opacity", 1);
                }
            }
            var keys = (event.ctrlKey ? " ctrl " : "") + (event.shiftKey ? " shift " : "") + (event.altKey ? " alt " : "");
            document.getElementById("logfile").innerHTML += event.type + " [" + keys + "] " + SVG.state().svg.id + " to filter by legend <br/>";
            return;
        } 
        document.getElementById("filter_mode").style['opacity'] = 1;
        document.getElementById("filter_mode").style['display'] = 'block';

        let ctrl = event.ctrlKey, cmd = event.metaKey, alt = event.altKey, shift = event.shiftKey;

        if (ctrl || cmd || alt || shift) {
            let opacity = !event.target.hasAttribute("opacity") ? 0.25 : 
                +event.target.getAttribute("opacity") === 1 ? 0.25 : 1;
            event.target.setAttribute("opacity", opacity);
        } else {
            event.target.setAttribute("opacity", 1);
            for (const mark of SVG.state().svg_marks) {
                if (mark === event.target) continue;
                mark.setAttribute("opacity", 0.25);
            }
        }

        var keys = (event.ctrlKey ? " ctrl " : "") + (event.shiftKey ? " shift " : "") + (event.altKey ? " alt " : "");
        document.getElementById("logfile").innerHTML += event.type + " [" + keys + "] " + SVG.state().svg.id + " to select mark <br/>";
    }

    function show_data(event) {
        SVG.state().interactions.brush.on_elem = true;

        create_tooltip("tooltip");
        let tooltip = document.querySelector("#tooltip");
        let data = "";
        let mark = event.target;

        if (!mark.__inferred__data__) return;
        
        for (const [key, value] of Object.entries(mark.__inferred__data__)) {
            data += String(key) + ": " + String(value);
            data += "<br/>";
        }
    
        tooltip.innerHTML = data;
        tooltip.style['visibility'] = 'visible';
        tooltip.style['left'] = event.pageX + 7;
        tooltip.style['top'] = event.pageY;
    }

    function showline(event) {
        const marks = SVG.state().svg_marks;
        var i = 0;
        for (const mark of marks) {
            // if (mark.style['opacity'] && +mark.style['opacity'] !== 1) return;
            ++i;
            line(SVG, event, mark, i);
        }
        if (marks.length > 1) {
            let tooltip = document.getElementById("tooltip");
            [...tooltip.children]
                .sort((a,b) => +a.children[2].innerHTML < +b.children[2].innerText ? 1 : -1)
                .forEach(node => tooltip.appendChild(node));
            for (let i = 0; i < tooltip.children.length - 1; ++i) {
                tooltip.children[i].children[2].innerHTML = +tooltip.children[i].children[2].innerHTML - 
                    +tooltip.children[i + 1].children[2].innerHTML;
            }
        }
    }

    function mousedown(event) {
        let marks = SVG.state().svg_marks;
        for (const mark of marks) {
            mark.style['opacity'] = mark.style['opacity'] && mark.style['opacity'] === 0.5 ? 1 : 0.5; 
        }
        this.style['opacity'] = this.style['opacity'] && this.style['opacity'] === 1 ? 0.5 : 1; 
    }

    for (const mark of SVG.state().svg_marks) {
        if (!mark.type || mark.type === "ellipse" || (!SVG.state().x_axis.ticks.length && !SVG.state().y_axis.ticks.length)) {
            mark.addEventListener('mouseenter', show_data);
            mark.addEventListener('mouseleave', mouseleave);
        } else {
            SVG.state().svg.addEventListener('mousemove', showline);
            mark.addEventListener('mouseenter', function(event) {
                SVG.state().interactions.brush.on_elem = true;
            });
            mark.addEventListener('mouseleave', function(event) {
                SVG.state().interactions.brush.on_elem = false;
            });
        }
        mark.style['cursor'] = 'pointer';
        mark.addEventListener('click', highlight);
        // mark.addEventListener('mousedown', mousedown);
    }

    control.addEventListener("change", function() {
        if (!this.checked) {
            d3.select("#" + SVG.state().svg.id).selectAll(".hover").attr("display", "none");
            let tooltips = document.querySelectorAll(".tooltip");
            if (tooltips.length) tooltips.forEach(d => d.style['visibility'] = 'hidden');
        } 

        for (const mark of SVG.state().svg_marks) {
            if (!mark.type || mark.type === "ellipse" || (!SVG.state().x_axis.ticks.length && !SVG.state().y_axis.ticks.length)) {
                this.checked ? mark.addEventListener('mouseenter', show_data) : mark.removeEventListener('mouseenter', show_data);
                this.checked ? mark.addEventListener('mouseleave', mouseleave) : mark.removeEventListener('mouseleave', mouseleave);
            } else {
                this.checked ? SVG.state().svg.addEventListener('mousemove', showline) : SVG.state().svg.removeEventListener('mousemove', showline);
            }
            // this.checked ? mark.addEventListener('mousedown', mousedown) : mark.removeEventListener('mousedown', mousedown);
        }
    });
}

function add_click(SVG) {
    for (const mark of svg_objects.svg_marks) {
        mark.addEventListener('click', show_data);
    }
}

function select(SVG, control) {
    create_hover(SVG, control);
    // add_click(svg_objects);
}

select.applyBrush = function(SVG, x, y, width, height) {
    d3.selectAll(".brush_tooltip").remove();

    let event1 = { clientX: x, pageX: x, clientY: y, pageY: y };
    let event2 = { clientX: x + +width, pageX: x + +width, clientY: y + +height, pageY: y + +height}
    let i = 0;
    for (const mark of SVG.state().svg_marks) {
        ++i;
        line(SVG, event1, mark, i, "brush1", "brush_tooltip");
        line(SVG, event2, mark, i, "brush2", "brush_tooltip");
    }

    if (SVG.state().svg_marks.length > 1) {
        let tooltips = [document.getElementById("tooltipbrush1"), document.getElementById("tooltipbrush2")];
        for (const tooltip of tooltips) {
            [...tooltip.children]
                .sort((a,b) => +a.children[2].innerHTML < +b.children[2].innerText ? 1 : -1)
                .forEach(node => tooltip.appendChild(node));
            for (let i = 0; i < tooltip.children.length - 1; ++i) {
                tooltip.children[i].children[2].innerHTML = +tooltip.children[i].children[2].innerHTML - 
                    +tooltip.children[i + 1].children[2].innerHTML;
            }
        }
    }
}

select.updateBrush = function(SVG) {
    if (!document.getElementById("_hoverlinebrush1")) return;
    let x1 = document.getElementById("_hoverlinebrush1").getBoundingClientRect().left;
    let y1 = document.getElementById("_hoverlinebrush1").getBoundingClientRect().top;
    let x2 = document.getElementById("_hoverlinebrush2").getBoundingClientRect().left;
    let y2 = document.getElementById("_hoverlinebrush2").getBoundingClientRect().top;

    let event1 = { clientX: x1, pageX: x1, clientY: y1, pageY: y1 };
    let event2 = { clientX: x2, pageX: x2, clientY: y2, pageY: y2 }
    let i = 0;
    for (const mark of SVG.state().svg_marks) {
        ++i;
        line(SVG, event1, mark, i, "brush1", "brush_tooltip");
        line(SVG, event2, mark, i, "brush2", "brush_tooltip");
    }

    if (SVG.state().svg_marks.length > 1) {
        let tooltips = [document.getElementById("tooltipbrush1"), document.getElementById("tooltipbrush2")];
        for (const tooltip of tooltips) {
            [...tooltip.children]
                .sort((a,b) => +a.children[2].innerHTML < +b.children[2].innerText ? 1 : -1)
                .forEach(node => tooltip.appendChild(node));
            for (let i = 0; i < tooltip.children.length - 1; ++i) {
                tooltip.children[i].children[2].innerHTML = +tooltip.children[i].children[2].innerHTML - 
                    +tooltip.children[i + 1].children[2].innerHTML;
            }
        }
    }
}

export { select };
