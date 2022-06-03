    // function collectOrphanTicks(axes) {
    //     for (const axis of axes) {
    //         for (const tick of axis.ticks) {
    //             let newTicks = [];
  
    //             for (const tickMark of tick.marks) {
    //                 for (const mark of state.svgMarks) {
    //                     if (!mark.__tick__ && compareTickStyles(mark, tickMark)) {
    //                             mark.removeAttribute('__mark__');
    //                             mark.__tick__ = true;
    //                             newTicks.push({'label': null, marks: [mark]});
    //                         }
    //                 }
    //             }

    //             axis.ticks = axis.ticks.concat(newTicks);
    //         }
    //     }
    // }

    // function pruneTicks(axis, position) {
    //     for (const tick of axis.ticks) {
    //         for (const mark of tick.marks) {
    //             const [lh, rh] = computeBounds(mark, position);
    //             if (lh > tick.range[0] && rh < tick.range[1]) {
    //                 mark.setAttribute('__mark__', true);
    //                 mark.__tick__ = false;
    //             }
    //         }

    //         tick.marks = tick.marks.filter(d => d.__tick__);
    //     }
    // }


    // export function groupLabels(state) {
//     function offset(tick, text) {
//         if (!text) return Number.MAX_VALUE;

//         const axis = tick['ticks'][0].className.baseVal;
//         const xOffset = Math.abs((text.clientRect.left + text.clientRect.right) / 2 - tick['offset']);
//         const yOffset = Math.abs((text.clientRect.top + text.clientRect.bottom) / 2 - tick['offset']);

//         return axis.includes('x-axis') ? xOffset : yOffset;
//     }

//     const axes = [state.xAxis, state.yAxis];
//     for (const axis of axes) {
//         const ticks = axis.ticks;

//         for (const tick of ticks) {
//             for (const axisTextMark of state.axisTextMarks) {
//                 const currOffset = offset(tick, tick['label']);
//                 const newOffset = offset(tick, axisTextMark);

//                 if (newOffset < currOffset) {
//                     const axis = tick['ticks'][0].className.baseVal;
//                     const tie = Math.abs(newOffset - currOffset) < epsilon && tick['label']
//                     ? axis.includes('x-axis') ? tick['label'].clientRect.top - axisTextMark.clientRect.top
//                     : axisTextMark.clientRect.left - tick['label'].clientRect.left
//                     : 1; 

//                     if (tie > 0) tick['label'] = axisTextMark;
//                 }
//             }

//             tick['label'].tick = true;
//         }
//     }

//     state.axisTextMarks.filter(textMark => !textMark.tick).map(textMark => state.textMarks.push(textMark));
//     state.axisTextMarks = state.axisTextMarks.filter(textMark => textMark.tick);
// }

// export function groupAxis(axis, index) {
//     let positionMap = { };

//     for (let i = 0; i < axis.ticks.length; ++i) {
//         let offset = axis.ticks[i].clientRect[index];
//         axis.ticks[i].setAttribute('class', (index === 'left' ? 'x-axis' : 'y-axis') + ' tick');

//         offset in positionMap ? positionMap[offset]['ticks'].push(axis.ticks[i]) 
//         : positionMap[offset] = { 'label': null, 'ticks': [axis.ticks[i]] };
//     }

//     axis.ticks = [];
//     for (const [key, value] of Object.entries(positionMap)) {
//         value['offset'] = +key;
//         axis.ticks.push(value);
//     }

//     axis.ticks.sort((first, second) => +first['offset'] < +second['offset'] ? -1 : (+first['offset'] > +second['offset'] ? 1 : 0))
// }

// export function groupLegend(state) {
//     let titleX, titleY,
//         minX = 10000, maxY = 0;
//     for (const text of state.textMarks) {
//         if (text.clientRect.left < minX) {
//             minX = text.clientRect.left;
//             titleY = text;
//         }
//         if (text.clientRect.bottom > maxY) {
//             maxY = text.clientRect.bottom;
//             titleX = text;
//         }
//     }

//     if (titleY && Math.abs(minX - state.svg.clientRect.left) < 50) {
//         titleY.__title__ = true;
//         state.titles.y = titleY;
//     }
//     if (titleX && Math.abs(maxY - state.svg.clientRect.bottom) < 50) {
//         titleX.__title__ = true;
//         state.titles.x = titleX;    
//     } 

//     for (const text of state.textMarks) {
//         if (text.__title__) continue;

//         let textX = (text.clientRect.left + text.clientRect.right) / 2,
//             textY = (text.clientRect.top + text.clientRect.bottom) / 2;
//         let minPos = 10000, minMark;

//         for (const mark of state.svgMarks) {
//             let markX = (mark.clientRect.left + mark.clientRect.right) / 2,
//                 markY = (mark.clientRect.bottom + mark.clientRect.bottom) / 2;
//             // let diff = Math.abs(mark_x - text_x) + Math.abs(mark_y - text_y);
//             let diff = Math.abs(markX - textX) + Math.abs(markY - textY);

//             if (diff < minPos) {
//                 minPos = diff;
//                 minMark = mark;
//             }
//         }

//         minMark.removeAttribute('__mark__');
//         text.setAttribute('__legend__', true);
//         minMark.setAttribute('__legend__', 'true');
//         // min_mark.style['pointer-events'] = 'fill';
//         // console.log(min_mark)
//         state.legend.push({'label': text, 'glyph': minMark});
//     }
// }


                        // const xOffset = min([
                        //     Math.abs(tickBB.left - textBB.left),
                        //     Math.abs(tickBB.left - textBB.right),
                        //     Math.abs(tickBB.right - textBB.left),
                        //     Math.abs(tickBB.right - textBB.right)
                        // ]);
                        // const yOffset = min([
                        //     Math.abs(tickBB.top - textBB.top),
                        //     Math.abs(tickBB.top - textBB.bottom),
                        //     Math.abs(tickBB.bottom - textBB.top),
                        //     Math.abs(tickBB.bottom - textBB.bottom)
                        // ]);

