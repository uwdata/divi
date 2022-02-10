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


function create_tooltip() {
    if (document.querySelector("#tooltip")) {
        return;
    }

    const div = document.createElement("div");
    div.id = "tooltip";
    div.style = "opacity:0.75; visibility:hidden; position:absolute; background-color:white; z-index:999; " +
        "border:solid; border-width:2px; border-radius:5px; padding:5px;";
    document.body.insertBefore(div, null);
}


function add_hover(SVG) {
    function showline(event) {
        const mark = event.target;
        const parentElement = mark.parentElement;
    
        let line = SVG.get_svg().querySelector("#_hoverline");
        if (line) { 
            line.setAttribute("x1", event.clientX - SVG.get_svg().getBoundingClientRect().left);
            line.setAttribute("x2", event.clientX - SVG.get_svg().getBoundingClientRect().left);
    
        } else {
            line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("stroke", "black");
            line.setAttribute("stroke-width", 1.5);
            line.setAttribute("opacity", "0.75");
            line.setAttribute("y1", SVG.get_y_axis_range()[0]);
            line.setAttribute("y2", SVG.get_y_axis_range()[1]);
            line.setAttribute("x1", event.clientX - SVG.get_svg().getBoundingClientRect().left);
            line.setAttribute("x2", event.clientX - SVG.get_svg().getBoundingClientRect().left);
            line.id = "_hoverline"
            SVG.get_svg().append(line);
        }
    }

    for (const mark of SVG.get_svg_marks()) {
        if (mark.nodeName === "path") {
            mark.addEventListener('mouseenter', showline);
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
    create_tooltip();
    add_hover(SVG);
    // add_click(svg_objects);
}

export { select };
