import { INTERACTION_CONSTANTS } from "./constants";

function constrain_elements(SVG) {
    let d = [...SVG.state().x_axis.ticks];
    d.sort((a, b) => {
        return +a['label'].getBoundingClientRect().left < +b['label'].getBoundingClientRect().left ? -1 : 1;
    });

    let labels = d.map(d => d['label'].innerHTML);
    SVG.state().x_axis.ordinal = labels;
    SVG.state().x_axis.scale.domain(labels);

    return d;
}

function dragElement(SVG) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    document.addEventListener('mousedown', dragMouseDown);
    var elmnt, tick, original_positions, sorted=false;

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
            // document.getElementById("logfile").innerHTML += e.type + " [" + keys + "] " + SVG.state().svg.id + " to sort <br/>";
            d3.select("#tooltip").attr("display", "none");

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
        if (sorted) return;

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
            // t.setAttribute("transform", "translate(" + (e.clientX - elmnt.__x__) + ", 0)");
        }

        let d = constrain_elements(SVG);
        console.log(d.map(d=>d['mark']))
        for (let i = 0; i < d.length; ++i) {
            if (d[i]['label'].innerHTML === tick['label'].innerHTML) continue;

            let t = d[i];
            let curr_pos = (+t['ticks'][0].getBoundingClientRect().left + 
                +t['ticks'][0].getBoundingClientRect().right ) / 2;

            let l = t['label'];
            let rotate = label.hasAttribute("transform") && l.getAttribute("transform").includes("rotate") ? +l.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g).pop() : null;
            l.setAttribute("transform", "translate(" + (original_positions[i] - curr_pos) + ", 0)" + (rotate ? " rotate(" + rotate + ")" : ""));

            for (const _t of d[i]['ticks']) {
                // _t.setAttribute("transform", "translate(" + (original_positions[i] - curr_pos) + ", 0)");
            }

            t['mark'].setAttribute("transform", "translate(" + (original_positions[i] - curr_pos) + ", 0)");
        }

        let sorted_position_map = new Map();
        let curr = SVG.state().x_axis.ticks.map(d => d['mark']);
        curr.sort(function(a, b) {
            let width1 = +a.getBoundingClientRect().left;
            let width2 = +b.getBoundingClientRect().left;
            return width1 < width2 ? -1 : 1;
        });

        let sorted_marks = SVG.state().x_axis.ticks.map(d => d['mark']);
        sorted_marks.sort(function(a, b) {
            let height1 = +a.getBoundingClientRect().top;
            let height2 = +b.getBoundingClientRect().top;
            return height1 > height2 ? -1 : 1;
        });
        for (let i = 0; i < sorted_marks.length; ++i) {
            sorted_position_map[sorted_marks[i].getAttribute("x")] = i;
        }

        if (sorted_marks[sorted_marks.length - 1] === curr[curr.length - 1]) {
            for (let i = 0; i < SVG.state().x_axis.ticks.length; ++i) {
                let m = SVG.state().x_axis.ticks[i]['mark'];
                let sorted_pos = sorted_position_map[m.getAttribute("x")];
                // console.log(m)
                // console.log(sorted_pos)
                // console.log(original_positions[sorted_pos])
                // console.log(original_positions[i])
                // console.log(original_positions[sorted_pos] - original_positions[i])
                // console.log('')

                let l = SVG.state().x_axis.ticks[i]['label'];
                let rotate = label.hasAttribute("transform") && l.getAttribute("transform").includes("rotate") ? +l.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g).pop() : null;
                l.setAttribute("transform", "translate(" + (original_positions[sorted_pos] - original_positions[i]) + ", 0)" + (rotate ? " rotate(" + rotate + ")" : ""));
    
                m.setAttribute("transform", "translate(" + (original_positions[sorted_pos] - original_positions[i]) + ", 0)");
            }
            sorted = true
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
