import { INTERACTION_CONSTANTS } from "./constants";

function constrain_elements(SVG) {
    SVG.state().x_axis.ticks.sort((a, b) => {
        return +a['label'].getBoundingClientRect().left < +b['label'].getBoundingClientRect().left ? -1 : 1;
    });

    let labels = SVG.state().x_axis.ticks.map(d => d['label'].innerHTML);
    SVG.state().x_axis.ordinal = labels;
    SVG.state().x_axis.scale.domain(labels);
}

function dragElement(SVG) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    document.addEventListener('mousedown', dragMouseDown);
    var elmnt, tick, original_positions;

    function dragMouseDown(e) {
        if (SVG.state().svg.parentElement.style['visibility'] === 'hidden') return;
        
        e = e || window.event;
        // e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        // elmnt.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        // elmnt.onmousemove = elementDrag;
        elmnt = null;
        tick = SVG.state().x_axis.ticks[0];
        original_positions = [];
        for (const mark of SVG.state().svg_marks) {
            if (mark.hasAttribute("__legend__")) continue;
            let bb = mark.getBoundingClientRect();
            if (e.clientX >= +bb.left && e.clientX <= +bb.right && e.clientY >= +bb.top && e.clientY <= +bb.bottom) {
                elmnt = mark;
                break;
            }
        }
        if (elmnt) {
            var keys = (e.ctrlKey ? " ctrl " : "") + (e.shiftKey ? " shift " : "") + (e.altKey ? " alt " : "");
            document.getElementById("logfile").innerHTML += e.type + " [" + keys + "] " + SVG.state().svg.id + " to sort <br/>";

            document.addEventListener('mousemove', elementDrag);
            document.addEventListener('mouseup', closeDragElement);
            elmnt.__x__ = e.clientX;

            SVG.state().svg_marks.sort((a, b) => {
                +a.getBoundingClientRect().left < +b.getBoundingClientRect().left ? -1 : 1;
            });

            let pos = (+elmnt.getBoundingClientRect().left + +elmnt.getBoundingClientRect().right) / 2;
            let min_diff = 1000;
            for (let i = 0; i < SVG.state().x_axis.ticks.length; ++i) {
                if (Math.abs(+SVG.state().x_axis.ticks[i]['ticks'][0].getBoundingClientRect().left - pos) < min_diff) {
                    min_diff = Math.abs(+SVG.state().x_axis.ticks[i]['ticks'][0].getBoundingClientRect().left - pos);
                    tick = SVG.state().x_axis.ticks[i]
                }

                let p = SVG.state().x_axis.ticks[i]['ticks'][0];
                original_positions.push((+p.getBoundingClientRect().left + +p.getBoundingClientRect().right) / 2);

                SVG.state().x_axis.ticks[i]['mark'] = SVG.state().svg_marks[i];
            }

            tick['__x__'] = e.clientX;
        }
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
        elmnt.setAttribute("transform", "translate(" + (e.clientX - elmnt.__x__) + ", 0)");

        let label = tick['label'];
        let rotate = label.hasAttribute("transform") && label.getAttribute("transform").includes("rotate") ? +label.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g).pop() : null;
        label.setAttribute("transform", "translate(" + (e.clientX - elmnt.__x__) + ", 0)" + (rotate ? " rotate(" + rotate + ")" : ""));

        for (const t of tick['ticks']) {
            t.setAttribute("transform", "translate(" + (e.clientX - elmnt.__x__) + ", 0)");
        }

        constrain_elements(SVG);
    
        for (let i = 0; i < SVG.state().x_axis.ticks.length; ++i) {
            if (SVG.state().x_axis.ticks[i]['label'].innerHTML === tick['label'].innerHTML) continue;

            let t = SVG.state().x_axis.ticks[i];
            let curr_pos = (+t['ticks'][0].getBoundingClientRect().left + 
                +t['ticks'][0].getBoundingClientRect().right ) / 2;

            let l = t['label'];
            let rotate = label.hasAttribute("transform") && l.getAttribute("transform").includes("rotate") ? +l.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g).pop() : null;
            l.setAttribute("transform", "translate(" + (original_positions[i] - curr_pos) + ", 0)" + (rotate ? " rotate(" + rotate + ")" : ""));

            for (const tick of SVG.state().x_axis.ticks[i]['ticks']) {
                tick.setAttribute("transform", "translate(" + (original_positions[i] - curr_pos) + ", 0)");
            }

            t['mark'].setAttribute("transform", "translate(" + (original_positions[i] - curr_pos) + ", 0)");
        }
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        // elmnt.onmouseup = null;
        // elmnt.onmousemove = null;
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('mouseup', closeDragElement);
        // constrain_elements(SVG);
    }
}    

export function sort(SVG) {
    if (!SVG.state().x_axis.ordinal.length) return;
    dragElement(SVG);
}
