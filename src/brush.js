import { drag } from "d3";
import { INTERACTION_CONSTANTS } from "./constants";

function dragElement(elmnt, SVG) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        elmnt.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.setAttribute("y", elmnt.getAttribute("y") - pos2);
        elmnt.setAttribute("x", elmnt.getAttribute("x") - pos1);

        SVG.filter(
            +elmnt.getAttribute("x") + +SVG.get_svg().getBoundingClientRect().left,
            +elmnt.getAttribute("y") + +SVG.get_svg().getBoundingClientRect().top,
            elmnt.getAttribute("width"),
            elmnt.getAttribute("height")
        );
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        elmnt.onmouseup = null;
        elmnt.onmousemove = null;
    }
}    

export function brush(SVG) {
    if (SVG.get_svg_marks()[0].nodeName === "path") {
        return;
    }

    let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("fill", "gray");
    rect.setAttribute("opacity", 0.35)
    rect.setAttribute("x", 0);
    rect.setAttribute("y", 0);
    rect.setAttribute("width", 0);
    rect.setAttribute("height", 0);

    let svg = SVG.get_svg();
    svg.appendChild(rect);

    let mousedown = false;
    svg.addEventListener("mousedown", function(e) {
        if (e.clientX - svg.getBoundingClientRect().left >= +rect.getAttribute("x") && 
            e.clientX - svg.getBoundingClientRect().left <= +rect.getAttribute("x") + +rect.getAttribute("width") &&
            e.clientY - svg.getBoundingClientRect().top >= +rect.getAttribute("y") &&
            e.clientY - svg.getBoundingClientRect().top <= +rect.getAttribute("y") + +rect.getAttribute("height")) {
            return;
        }
        rect.setAttribute("width", 0);
        rect.setAttribute("height", 0);
        e.preventDefault();
        mousedown = true;
        rect.setAttribute("x", e.clientX - svg.getBoundingClientRect().left);
        rect.setAttribute("y", e.clientY - svg.getBoundingClientRect().top);
    });
    svg.addEventListener("mousemove", function(e) {
        if (mousedown) {
            e.preventDefault();
            rect.setAttribute("width", e.clientX - rect.getAttribute("x") - svg.getBoundingClientRect().left);
            rect.setAttribute("height", e.clientY - rect.getAttribute("y") - svg.getBoundingClientRect().top);
            SVG.filter(
                +rect.getAttribute("x") + +svg.getBoundingClientRect().left,
                +rect.getAttribute("y") + +svg.getBoundingClientRect().top,
                rect.getAttribute("width"),
                rect.getAttribute("height")
            );
        }
    });
    svg.addEventListener("mouseup", function(e) {
        mousedown = false;
    })

    dragElement(rect, SVG);
}
