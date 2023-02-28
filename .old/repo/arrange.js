import { INTERACTION_CONSTANTS } from "../constants";

function dragElement(SVG) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    document.addEventListener('mousedown', dragMouseDown);
    var elmnt;

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

        for (const mark of SVG.state().svg_marks) {
            if (mark.hasAttribute("__legend__")) continue;
            let bb = mark.getBoundingClientRect();
            if (e.clientX >= +bb.left && e.clientX <= +bb.right && e.clientY >= +bb.top && e.clientY <= +bb.bottom) {
                elmnt = mark;
                break;
            }
        }
        if (elmnt) {
            document.addEventListener('mousemove', elementDrag);
            document.addEventListener('mouseup', closeDragElement);
            elmnt.__y__ = e.clientY;
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
        elmnt.setAttribute("transform", "translate(0," + (e.clientY - elmnt.__y__) + ")");

        // let d = constrain_elements(SVG);
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        // elmnt.onmouseup = null;
        // elmnt.onmousemove = null;
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('mouseup', closeDragElement);
        // constrain_elements(SVG);

        let groups = new Map();
        let offset, ordering;
        let color = window.getComputedStyle(elmnt).fill;

        for (const mark of SVG.state().svg_marks) {
            if (mark.hasAttribute("__legend__")) continue;
            if (mark === elmnt) offset = +mark.getBoundingClientRect().left;
            let o = +mark.getBoundingClientRect().left;
            groups[o] ? groups[o].push(mark) : groups[o] = [mark];
        }

        groups[offset].sort(function(a, b) {
            let y1 = +a.getBoundingClientRect().bottom;
            let y2 = +b.getBoundingClientRect().bottom;
            return y1 > y2 ? -1 : 1
        });
    
        for (let i = 0; i < groups[offset].length; ++i) {
            if (groups[offset][i] === elmnt) {
                ordering = i;
                break;
            }
        }

        for (const [_, group] of Object.entries(groups)) {
            let el;
            for (const mark of group) {
                if (window.getComputedStyle(mark).fill === color) {
                    el = mark;
                    break;
                }
            }

            el.setAttribute("y", +group[ordering - 1].getAttribute("y") - +el.getAttribute("height"));
            el.setAttribute("transform", "translate(0, 0)");

            for (let i = ordering; i < group.length; ++i) {
                if (group[i] === el) continue;
                let e = i === ordering ? el : group[i - 1];
                group[i].setAttribute("y", +e.getAttribute("y") - +group[i].getAttribute("height"));
            }
        }

        // Legend
        ordering = SVG.state().legend.length - ordering - 1;
        let l = SVG.state().legend[ordering];
        let curr;
        for (let i = 0; i < SVG.state().legend.length; ++i) {
            if (window.getComputedStyle(SVG.state().legend[i]['glyph']).fill === color) {
                curr = i;
                break;
            }
        }
        
        for (let i = curr; i < ordering; ++i) {
            let parent1 = SVG.state().legend[curr]['label'].parentElement;
            let parent2 = SVG.state().legend[i + 1]['label'].parentElement;
            parent1.appendChild(SVG.state().legend[i + 1]['label']);
            parent1.appendChild(SVG.state().legend[i + 1]['glyph']);
            parent2.appendChild(SVG.state().legend[curr]['label']);
            parent2.appendChild(SVG.state().legend[curr]['glyph']);
        }

        // console.log(l['label'])
        // console.log(SVG.state().legend[ordering + 1]['label'])
        // l['label'].setAttribute("y", +SVG.state().legend[ordering + 1]['label'].getAttribute("y"));
        // l['glyph'].setAttribute("y", +SVG.state().legend[ordering - 1]['glyph'].getAttribute("y") - 
        //     +SVG.state().legend[ordering]['glyph'].getAttribute("height"));
    }
}    

export function arrange(SVG) {
    if (!SVG.state().x_axis.ordinal.length) return;
    dragElement(SVG);
}
