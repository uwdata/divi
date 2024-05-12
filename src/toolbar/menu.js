import { select } from 'd3-selection';
import navigateIcon from './icons/navigate.svg';
import annotateIcon from './icons/annotate.svg';
import filterIcon from './icons/filter.svg';
import linkIcon from './icons/link.svg';
import brushIcon from './icons/brush.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SelectOpacity, UnselectOpacity } from '../state/constants.js';

export function createMenu(states) {
    const { svg } = states[0];
    const container = select(svg.parentElement);
    const menu = container.append('div')
        .attr('id', 'menu')
        .classed('card', 'true')
        .classed('bg-light', true)
        .style('position', 'relative')
        .style('display', 'inline-block')
        .style('margin-top', '10px')
        .style('margin-bottom', '10px')
        .style('margin-left', '10px')
        .style('margin-right', '10px');
    container.node().appendChild(svg);

    const nav = menu.append('div')
        .html(navigateIcon)
        .style('opacity', UnselectOpacity);

    const brush = menu.append('div')
        .html(brushIcon);

    menu.append('div')
        .html(filterIcon);

    menu.append('div')
        .html(annotateIcon);

    menu.append('div')
        .classed('btn-secondary', true)
        .html(linkIcon);

    menu.selectAll('div')
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
