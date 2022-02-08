import { INTERACTION_CONSTANTS } from "./constants";

function mouseover(event) {
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

function createTooltip() {
    if (document.querySelector("#tooltip")) {
        return;
    }

    const div = document.createElement("div");
    div.id = "tooltip";
    div.style = "opacity:0.75; visibility:hidden; position:absolute; background-color:white; z-index:999; " +
        "border:solid; border-width:2px; border-radius:5px; padding:5px;";
    document.body.insertBefore(div, null);
}

function hover(svg_objects) {
    createTooltip();
    for (const mark of svg_objects.svg_marks) {
        mark.addEventListener('mouseover', mouseover);
        mark.addEventListener('mouseleave', mouseleave);
    }
}

export { hover };
