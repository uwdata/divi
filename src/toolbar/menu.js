import { select } from 'd3-selection';
import navigateIcon from './icons/navigate.svg';
// import annotateIcon from './icons/annotate.svg';
import filterIcon from './icons/filter.svg';
import linkIcon from './icons/link.svg';
// import downloadIcon from './icons/download.svg';
import brushIcon from './icons/brush.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SelectOpacity, UnselectOpacity } from '../state/constants.js';

export function createMenu(states) {
    const { svg } = states[states.length - 1];
    const svgRect = svg._getBBox();
    const div = select(document.body)
        .append('div')
        .attr('id', 'menu')
        .classed('card', 'true')
        .classed('bg-light', true)
        .style('position', 'absolute')
        .style('vertical-align', 'middle')
        .style('top', (svgRect.top + 20) + 'px')
        .style('left', (svgRect.left - 20) + 'px');

    const nav = div.append('div')
        .html(navigateIcon)
        .style('opacity', UnselectOpacity);

    const brush = div.append('div')
        .html(brushIcon);

    div.append('div')
        .html(filterIcon);

    div.append('div')
        .classed('btn-secondary', true)
        .html(linkIcon);

    div.selectAll('div')
        .classed('btn', true)
        .classed('m-1', true)
        .selectAll('svg')
        .attr('width', 20)
        .attr('height', 20);

    nav.on('click', function() {
        states.forEach(s => {
            s.interactions.navigate = !s.interactions.navigate;
            if (s.interactions.navigate) {
                s.interactions.brush = false;
                brush.style('opacity', s.interactions.brush ? SelectOpacity : UnselectOpacity);
            }
            nav.style('opacity', s.interactions.navigate ? SelectOpacity : UnselectOpacity);
        });
    });

    brush.on('click', function() {
        states.forEach(s => {
            s.interactions.brush = !s.interactions.brush;
            if (s.interactions.brush) {
                s.interactions.navigate = false;
                nav.style('opacity', s.interactions.navigate ? SelectOpacity : UnselectOpacity);
            }
            brush.style('opacity', s.interactions.brush ? SelectOpacity : UnselectOpacity);
        });
    });
}
