import { coordinate } from './orchestration/coordinator.js';
import { parseDataset } from './parsers/helpers/data-parser.js';

export async function hydrate(svg, options = {}) {
    if (!svg) return;
    if (!Array.isArray(svg)) svg = [svg];

    svg = svg.map(d => typeof d === 'string' ? document.querySelector(d) : d);
    return coordinate(svg, await parseDataset(options));
}
