import { INTERACTION_CONSTANTS } from "./constants";
// import { svg_objects } from "./inspect";

function mouseover(event) {
    let tooltip = document.getElementById("tooltip");
    let data = "";
    let mark = event.target;
    let iterable = "datum" in mark.__data__ ? 
        mark.__data__.datum : 
        ("data" in mark.__data__ ? mark.__data__.data : mark.__data__);

    for (const [key, value] of Object.entries(iterable)) {
        data += String(key) + ": " + String(value);
        data += "<br/>";
    }

    tooltip.innerHTML = data;
    tooltip.style['visibility'] = 'visible';
    tooltip.style['left'] = event.clientX;
    tooltip.style['top'] = event.clientY;
}

function mouseleave() {
    let tooltip = document.getElementById("tooltip");
    tooltip.style['visibility'] = 'hidden';
}

function hover() {
    for (const mark of svg_marks) {
        mark.addEventListener('mouseover', mouseover);
        mark.addEventListener('mouseleave', mouseleave);
    }
}

export { hover, mouseover, mouseleave };
