import { INTERACTION_CONSTANTS } from "./constants";

function mouseleave() {
    let tooltip = document.querySelector("#tooltip");
    tooltip.style['visibility'] = 'hidden';
}

function create_tooltip(id) {
    if (document.querySelector("#" + id)) return;

    const div = document.createElement("div");
    div.id = id;
    div.setAttribute("class", "tooltip");
    div.style = "opacity:0.75; visibility:hidden; position:absolute; background-color:white; z-index:999; " +
        "border:solid; border-width:2px; border-radius:5px; padding:5px; font-weight:bold;";
    document.body.insertBefore(div, null);
}


function create_hover(SVG, control) {
    function show_data(event) {
        let tooltip = document.querySelector("#tooltip");
        let data = "";
        let mark = event.target;

        for (const [key, value] of Object.entries(mark.__inferred__data__)) {
            data += String(key) + ": " + String(value);
            data += "<br/>";
        }
    
        tooltip.innerHTML = data;
        tooltip.style['visibility'] = 'visible';
        tooltip.style['left'] = event.pageX;
        tooltip.style['top'] = event.pageY;
    }

    function showline(event) {
        const marks = SVG.state().svg_marks;
        var i = 0;
        for (const mark of marks) {
            ++i;
            let transform = mark.getAttribute('transform');
            let x_scale = 1, x_translate = 0;
            if (transform) {
                let t = transform.match(/(-?\d+\.?\d*)/g);
                x_translate = +t[0];
                x_scale = +t[2];
            }

            let offset = SVG.state().x_axis.ticks[0]['ticks'][0].parentNode._global_transform[0] 
                + SVG.state().svg.getBoundingClientRect().left,
                path_x = event.clientX - offset,
                start = SVG.state().x_axis.range[0], 
                end = mark.getTotalLength(),
                target, 
                pos;

            if (path_x < SVG.state().x_axis.range[0] || SVG.state().x_axis.range[1] < path_x ) {
                d3.selectAll(".hover").attr("visibility", "hidden");
            } else {
                d3.selectAll(".hover").attr("visibility", "visible");
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
                }  else if (pos.x < path_x) {
                    start = target;
                }
                else {
                    break; //position found
                }
            }

            let y = pos.y + SVG.state().y_axis.ticks[0]['ticks'][0].parentNode._global_transform[1];
            let y_domain = SVG.state().y_axis.scale.invert(
                y - SVG.state().y_axis.ticks[0]['ticks'][0].parentNode._global_transform[1]
            );
            let data_x = SVG.state().x_axis.scale.invert(pos.x);
            data_x = typeof data_x === "number" ? data_x.toFixed(2) : data_x;
            let circle = SVG.state().svg.querySelector("#_circle" + i);

            let tooltip = document.querySelector("#tooltip" + i);
            if (!tooltip) {
                create_tooltip("tooltip" + i);
            } 
            tooltip = document.querySelector("#tooltip" + i);
            tooltip.innerHTML = "(" + data_x + ", " + y_domain.toFixed(2) + ")";
            tooltip.style['visibility'] = 'visible';
            tooltip.style['left'] = event.pageX + 7.5;
            tooltip.style['top'] = event.pageY - event.clientY + y + 
                SVG.state().svg.getBoundingClientRect().top - 15;

            if (circle) {
                circle.setAttribute("cx", (path_x * x_scale + x_translate) 
                    + SVG.state().x_axis.ticks[0]['ticks'][0].parentNode._global_transform[0]);
                circle.setAttribute("cy", y);
                circle.setAttribute("display", "");
            } else {
                circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("r", 5);
                circle.setAttribute("fill", "none");
                circle.setAttribute("stroke", "black");
                circle.setAttribute("stroke-width", '1px');
                circle.id = "_circle" + i;
                circle.setAttribute("class", "hover");
                SVG.state().svg.append(circle);
                circle.setAttribute("cx", (path_x * x_scale + x_translate) 
                    + SVG.state().x_axis.ticks[0]['ticks'][0].parentNode._global_transform[0]);
                circle.setAttribute("cy", y);
            }
        
            let line = SVG.state().svg.querySelector("#_hoverline");
            if (line) { 
                line.setAttribute("x1", event.clientX - SVG.state().svg.getBoundingClientRect().left);
                line.setAttribute("x2", event.clientX - SVG.state().svg.getBoundingClientRect().left);
                line.setAttribute("display", "");
            } else {
                line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("stroke", "black");
                line.setAttribute("stroke-width", 1.5);
                line.setAttribute("opacity", "0.65");
                line.setAttribute("class", "hover")
                line.setAttribute("y1", 
                    SVG.state().y_axis.range[0] + SVG.state().y_axis.ticks[0]['ticks'][0].parentNode._global_transform[1]);
                line.setAttribute("y2", 
                    SVG.state().y_axis.range[1] + SVG.state().y_axis.ticks[0]['ticks'][0].parentNode._global_transform[1]);
                line.setAttribute("x1", event.clientX - SVG.state().svg.getBoundingClientRect().left);
                line.setAttribute("x2", event.clientX - SVG.state().svg.getBoundingClientRect().left);
                line.id = "_hoverline"
                SVG.state().svg.append(line);
            }
        }
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
        }
    });
}

function add_click(SVG) {
    for (const mark of svg_objects.svg_marks) {
        mark.addEventListener('click', show_data);
    }
}

function select(SVG, control) {
    create_tooltip("tooltip");
    create_hover(SVG, control);
    // add_click(svg_objects);
}

export { select };
