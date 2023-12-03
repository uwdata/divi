import { orchestrate } from './orchestration/orchestrate.js';
import { parseDataset } from './parsers/dataset-parser.js';

export async function hydrate(svg, options = {}) {
    if (!svg) return;
    if (!Array.isArray(svg)) svg = [svg];

    svg = svg.map(d => typeof d === 'string' ? document.querySelector(d) : d);
    return orchestrate(svg, await parseDataset(options));
}
