import { INTERACTION_CONSTANTS } from "./constants";

function show_data(event) {
    let tooltip = document.querySelector("#tooltip");
    let data = "";
    let mark = event.target;

    let has_datum = "datum" in mark.__data__;
    let has_properties = "properties" in mark.__data__;
    let has_data = "data" in mark.__data__;

    let iterable = has_datum ? mark.__data__.datum : 
        has_properties ? mark.__data__.properties :
        has_data ? mark.__data__.data : mark.__data__;

    for (const [key, value] of Object.entries(iterable)) {
        data += String(key) + ": " + String(value);
        data += "<br/>";
    }

    tooltip.innerHTML = data;
    tooltip.style['visibility'] = 'visible';
    tooltip.style['left'] = event.pageX;
    tooltip.style['top'] = event.pageY;
}

function mouseleave() {
    let tooltip = document.querySelector("#tooltip");
    tooltip.style['visibility'] = 'hidden';
}


function create_tooltip(id) {
    if (document.querySelector("#" + id)) {
        return;
    }

    const div = document.createElement("div");
    div.id = id;
    div.style = "opacity:0.75; visibility:hidden; position:absolute; background-color:white; z-index:999; " +
        "border:solid; border-width:2px; border-radius:5px; padding:5px;";
    document.body.insertBefore(div, null);
}


function add_hover(SVG) {
    function showline(event) {
        const marks = SVG.get_svg_marks();
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

            let offset = SVG.get_x_axis_ticks()[0]._global_transform[0] + SVG.get_svg().getBoundingClientRect().left,
                path_x = event.clientX - offset,
                start = SVG.get_x_axis_range()[0], 
                end = mark.getTotalLength(),
                target, 
                pos;

            if (path_x < SVG.get_x_axis_range()[0] || SVG.get_x_axis_range()[1] < path_x ) {
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
    
            let y = pos.y + SVG.get_y_axis_ticks()[0]._global_transform[1];
            let y_domain = SVG.get_y_scale().invert(y - SVG.get_y_axis_ticks()[0]._global_transform[1]);
            let circle = SVG.get_svg().querySelector("#_circle" + i);

            let tooltip = document.querySelector("#tooltip" + i);
            if (!tooltip) {
                create_tooltip("tooltip" + i);
            } 
            tooltip = document.querySelector("#tooltip" + i);
            tooltip.innerHTML = y_domain.toFixed(2);
            tooltip.style['visibility'] = 'visible';
            tooltip.style['left'] = event.pageX + 7.5;
            tooltip.style['top'] = event.pageY - event.clientY + y + 
                SVG.get_svg().getBoundingClientRect().top - 12.5;

            if (circle) {
                circle.setAttribute("cx", (path_x * x_scale + x_translate) + SVG.get_x_axis_ticks()[0]._global_transform[0]);
                circle.setAttribute("cy", y);
            } else {
                circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("r", 5);
                circle.setAttribute("fill", "none");
                circle.setAttribute("stroke", "black");
                circle.setAttribute("stroke-width", '1px');
                circle.id = "_circle" + i;
                circle.setAttribute("class", "hover");
                SVG.get_svg().append(circle);
                circle.setAttribute("cx", (path_x * x_scale + x_translate) + SVG.get_x_axis_ticks()[0]._global_transform[0]);
                circle.setAttribute("cy", y);
            }
        
            let line = SVG.get_svg().querySelector("#_hoverline");
            if (line) { 
                line.setAttribute("x1", event.clientX - SVG.get_svg().getBoundingClientRect().left);
                line.setAttribute("x2", event.clientX - SVG.get_svg().getBoundingClientRect().left);
            } else {
                line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("stroke", "black");
                line.setAttribute("stroke-width", 1.5);
                line.setAttribute("opacity", "0.65");
                line.setAttribute("class", "hover")
                line.setAttribute("y1", SVG.get_y_axis_range()[0] + SVG.get_y_axis_ticks()[0]._global_transform[1]);
                line.setAttribute("y2", SVG.get_y_axis_range()[1] + SVG.get_y_axis_ticks()[0]._global_transform[1]);
                line.setAttribute("x1", event.clientX - SVG.get_svg().getBoundingClientRect().left);
                line.setAttribute("x2", event.clientX - SVG.get_svg().getBoundingClientRect().left);
                line.id = "_hoverline"
                SVG.get_svg().append(line);
            }
        }
    }

    for (const mark of SVG.get_svg_marks()) {
        if (mark.nodeName === "path" && (!mark.contour || Math.abs(mark.contour[mark.contour.length - 2].y - mark.contour[0].y) < 5)) {
            SVG.get_svg().addEventListener('mousemove', showline);
        } else {
            mark.addEventListener('mouseenter', show_data);
            mark.addEventListener('mouseleave', mouseleave);
        }
    }
}

function add_click(SVG) {
    for (const mark of svg_objects.svg_marks) {
        mark.addEventListener('click', show_data);
    }
}

function select(SVG) {
    create_tooltip("tooltip");
    add_hover(SVG);
    // add_click(svg_objects);
}

export { select };
