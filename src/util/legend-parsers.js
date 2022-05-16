export function groupLegend(state) {
    let titleX, titleY,
        minX = 10000, maxY = 0;
    for (const text of state.textMarks) {
        if (text.clientRect.left < minX) {
            minX = text.clientRect.left;
            titleY = text;
        }
        if (text.clientRect.bottom > maxY) {
            maxY = text.clientRect.bottom;
            titleX = text;
        }
    }

    if (titleY && Math.abs(minX - state.svg.clientRect.left) < 50) {
        titleY.__title__ = true;
        state.titles.y = titleY;
    }
    if (titleX && Math.abs(maxY - state.svg.clientRect.bottom) < 50) {
        titleX.__title__ = true;
        state.titles.x = titleX;    
    } 

    for (const text of state.textMarks) {
        if (text.__title__) continue;

        let textX = (text.clientRect.left + text.clientRect.right) / 2,
            textY = (text.clientRect.top + text.clientRect.bottom) / 2;
        let minPos = 10000, minMark;

        for (const mark of state.svgMarks) {
            let markX = (mark.clientRect.left + mark.clientRect.right) / 2,
                markY = (mark.clientRect.bottom + mark.clientRect.bottom) / 2;
            // let diff = Math.abs(mark_x - text_x) + Math.abs(mark_y - text_y);
            let diff = Math.abs(markX - textX) + Math.abs(markY - textY);

            if (diff < minPos) {
                minPos = diff;
                minMark = mark;
            }
        }

        minMark.removeAttribute('__mark__');
        text.setAttribute('__legend__', true);
        minMark.setAttribute('__legend__', 'true');
        // min_mark.style['pointer-events'] = 'fill';
        // console.log(min_mark)
        state.legend.push({'label': text, 'glyph': minMark});
    }
}
