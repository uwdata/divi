import { select } from "d3-selection";
import navigateIcon from './icons/navigate.svg';
import annotateIcon from './icons/annotate.svg';
import filterIcon from './icons/filter.svg';
import linkIcon from './icons/link.svg';
import downloadIcon from './icons/download.svg';
import brushIcon from './icons/brush.svg';
import 'bootstrap/dist/css/bootstrap.min.css';

export function createMenu(svg) {
    const svgRect = svg._getBBox();
    const div = select(document.body)
        .append('div')
        .attr('id', 'menu')
        .classed('card', 'true')
        .classed('bg-light', true)
        .style('position', 'absolute')
        .style('vertical-align', 'middle')
        .style('top', (svgRect.top + 20) + 'px')
        .style('left', (svgRect.right + 20) + 'px');

    div.append('div')
        .html(navigateIcon);

    div.append('div')
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
}
