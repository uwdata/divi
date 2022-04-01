import { drag } from "d3";
import { INTERACTION_CONSTANTS } from "./constants";

function dragElement(elmnt, SVG, constrains) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        // e.preventDefault();
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
        if (!constrains[1]) elmnt.setAttribute("y", elmnt.getAttribute("y") - pos2);
        if (!constrains[0]) elmnt.setAttribute("x", elmnt.getAttribute("x") - pos1);

        SVG.filter(
            +elmnt.getAttribute("x") + +SVG.state().svg.getBoundingClientRect().left,
            +elmnt.getAttribute("y") + +SVG.state().svg.getBoundingClientRect().top,
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

export function brush(SVG, control, axis_control) {
    // if (SVG.state().svg_marks[0].nodeName === "path") {
    //     return;
    // }

    let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("fill", "gray");
    rect.setAttribute("opacity", 0.35)
    rect.setAttribute("x", 0);
    rect.setAttribute("y", 0);
    rect.setAttribute("width", 0);
    rect.setAttribute("height", 0);
    rect.setAttribute("id", "brush-rect")
    // rect.style['cursor'] = 'move';
    // rect.style['strokeWidth'] = '2px';
    rect.style['stroke'] = '#fff';

    let svg = SVG.state().svg;
    svg.appendChild(rect);

    let mousedown = false,
        constrains = [false, false];

    function update_rect() {
        if (+rect.getAttribute("width") === 0 || +rect.getAttribute("height") === 0) return;
        if (constrains[0]) {
            rect.setAttribute("x", SVG.state().x_axis.global_range[0]);
            rect.setAttribute("width", SVG.state().x_axis.global_range[1] - SVG.state().x_axis.global_range[0]);
        } else if (constrains[1]) {
            rect.setAttribute("y", SVG.state().y_axis.global_range[1]);
            rect.setAttribute("height", SVG.state().y_axis.global_range[0] - SVG.state().y_axis.global_range[1]);
        }

        SVG.filter(
            +rect.getAttribute("x") + +svg.getBoundingClientRect().left,
            +rect.getAttribute("y") + +svg.getBoundingClientRect().top,
            rect.getAttribute("width"),
            rect.getAttribute("height")
        );
    }
    
    function mousedown_callback(e) {
        if (!SVG.state().interactions.brush.flag || SVG.state().interactions.brush.on_elem) return;
        // let intersects = false;
        //     for (const mark of SVG.state().svg_marks) {
        //         if (mark.type === "line" || mark.type === "polygon") continue;
        //         let bb = mark.getBoundingClientRect();
        //         if (e.clientX >= +bb.left && e.clientX <= +bb.right && e.clientY >= +bb.top && e.clientY <= +bb.bottom) {
        //             intersects = true;
        //             break;
        //         }
        //     }

        // if (intersects) return;

        // SVG.disambiguate("brush");
        // document.getElementById('pan_disam').style['display'] = 'block';

        if (e.clientX - svg.getBoundingClientRect().left >= +rect.getAttribute("x") && 
            e.clientX - svg.getBoundingClientRect().left <= +rect.getAttribute("x") + +rect.getAttribute("width") &&
            e.clientY - svg.getBoundingClientRect().top >= +rect.getAttribute("y") &&
            e.clientY - svg.getBoundingClientRect().top <= +rect.getAttribute("y") + +rect.getAttribute("height")) {
            return;
        }

        SVG.state().interactions.brush.active = true;

        var left_bound = SVG.state().svg_marks[0]._global_transform[0] + SVG.state().svg.getBoundingClientRect().left;
        var top_bound = SVG.state().svg_marks[0]._global_transform[1] + SVG.state().svg.getBoundingClientRect().top;

        let x_flag = e.clientX - left_bound > SVG.state().x_axis.range[0], 
            y_flag = e.clientY - top_bound < SVG.state().y_axis.range[0];

        let brush_Y = !x_flag && y_flag;
        let brush_X = (x_flag && !y_flag) || 
            ((SVG.state().svg_marks[0].type === "line" || SVG.state().svg_marks[0].type === "polygon") && !brush_Y && 
            SVG.state().x_axis.ticks.length);

        // let std = SVG.std();
        // if (std < 0.5 && !brush_X && !brush_Y) {
        //     brush_X = false;
        //     brush_Y = true;
        // } else if (std > 2 && !brush_X && !brush_Y) {
        //     brush_X = true;
        //     brush_Y = false;
        // }

        constrains[0] || brush_Y ? 
            rect.setAttribute("width", SVG.state().x_axis.global_range[1] - SVG.state().x_axis.global_range[0]) : 
            rect.setAttribute("width", 0);
        constrains[1] || brush_X ? 
            rect.setAttribute("height", SVG.state().y_axis.global_range[0] - SVG.state().y_axis.global_range[1]) :
            rect.setAttribute("height", 0);

        e.preventDefault();
        mousedown = true;
        constrains[0] || brush_Y ? 
            rect.setAttribute("x", SVG.state().x_axis.global_range[0]) :
            rect.setAttribute("x", e.clientX - svg.getBoundingClientRect().left);
        constrains[1] || brush_X ? 
            rect.setAttribute("y", SVG.state().y_axis.global_range[1]) :
            rect.setAttribute("y", e.clientY - svg.getBoundingClientRect().top);

        var keys = (e.ctrlKey ? " ctrl " : "") + (e.shiftKey ? " shift " : "") + (e.altKey ? " alt " : "");
        document.getElementById("logfile").innerHTML += e.type + " [" + keys + "] " + SVG.state().svg.id + " to brush [" +
            (!brush_X && !brush_Y ? "2D" : (brush_X ? "X-AXIS" : "Y-AXIS")) + "] <br/>";
    }

    function mousemove_callback(e) {
        // var brush_shift = document.getElementById("brush-shift").className.split(" ").indexOf("bg-primary") > -1 &&
        //     document.getElementById("brush-drag").className.split(" ").indexOf("bg-primary") <= -1;
        // var brush_shift = false;
        // if ((brush_shift && !e.shiftKey) || (!brush_shift && e.shiftKey)) return;
        var left_bound = SVG.state().svg_marks[0]._global_transform[0] + SVG.state().svg.getBoundingClientRect().left;
        var top_bound = SVG.state().svg_marks[0]._global_transform[1] + SVG.state().svg.getBoundingClientRect().top;

        let x_flag = e.clientX - left_bound > SVG.state().x_axis.range[0], 
            y_flag = e.clientY - top_bound < SVG.state().y_axis.range[0];
        let brush_Y = !x_flag && y_flag;
        let brush_X = (x_flag && !y_flag) ||
            ((SVG.state().svg_marks[0].type === "line" || SVG.state().svg_marks[0].type === "polygon") && !brush_Y &&
            SVG.state().x_axis.ticks.length);

        if (mousedown) {
            e.preventDefault();
            let width = e.clientX - rect.getAttribute("x") - svg.getBoundingClientRect().left;
            let height = e.clientY - rect.getAttribute("y") - svg.getBoundingClientRect().top;
            constrains[0] || brush_Y ? 
                rect.setAttribute("width", SVG.state().x_axis.global_range[1] - SVG.state().x_axis.global_range[0]) :
                rect.setAttribute("width", Math.abs(width));
            constrains[1] || brush_X ?
                rect.setAttribute("height", SVG.state().y_axis.global_range[0] - SVG.state().y_axis.global_range[1]) :
                rect.setAttribute("height", Math.abs(height));
            

            let x_translate = !brush_Y && width < 0 ? width : 0;
            let y_translate = !brush_X && height < 0 ? height : 0;
            rect.setAttribute("transform", "translate(" + x_translate + "," + y_translate + ")");
            // if (SVG.state().svg_marks[0].type !== "line" && SVG.state().svg_marks[0].type !== "polygon") {
                SVG.filter(
                    +rect.getAttribute("x") + +svg.getBoundingClientRect().left + x_translate,
                    +rect.getAttribute("y") + +svg.getBoundingClientRect().top + y_translate,
                    Math.abs(+rect.getAttribute("width")),
                    Math.abs(+rect.getAttribute("height")),
                    e.ctrlKey || e.metaKey || e.altKey || e.shiftKey
                );
            // }
        }
    };

    function mouseup_callback(e) {
        if (!SVG.state().interactions.brush.active) return;
        SVG.state().interactions.brush.active = false;
        mousedown = false;
        if (+rect.getAttribute("width") === 0 || +rect.getAttribute("height") === 0) { 
            SVG.unfilter();
            // document.getElementById('pan_disam').style['display'] = 'none';
            // SVG.disambiguate("brush", true);
            d3.selectAll(".brush_tooltip").remove();
            document.getElementById("logfile").innerHTML += "reset brush <br/>"
        } else {
            rect.setAttribute("width", 0);
            rect.setAttribute("height", 0);
        }
    };

    svg.addEventListener("mousedown", mousedown_callback);
    svg.addEventListener("mousemove", mousemove_callback);
    svg.addEventListener("mouseup", mouseup_callback);

    control.addEventListener('change', function() {
        if (!this.checked) { 
            SVG.unfilter();
            rect.setAttribute("width", 0);
            rect.setAttribute("height", 0);
        }

        this.checked ? svg.addEventListener("mousedown", mousedown_callback) : svg.removeEventListener("mousedown", mousedown_callback);
        this.checked ? svg.addEventListener("mousemove", mousemove_callback) : svg.removeEventListener("mousemove", mousemove_callback);
        this.checked ? svg.addEventListener("mouseup", mouseup_callback) : svg.removeEventListener("mouseup", mouseup_callback);
    });

    document.querySelectorAll('ul.brush a.axis').forEach(d => d.addEventListener('click', function(event) {
        switch(event.target.innerHTML) {
            case "2D":
                constrains[0] = constrains[1] = false;
                break;
            case "X axis":
                constrains[0] = false;
                constrains[1] = true;
                break;
            case "Y axis":
                constrains[0] = true;
                constrains[1] = false;
                break;
        }
        update_rect();
    }));

    dragElement(rect, SVG, constrains);
}
