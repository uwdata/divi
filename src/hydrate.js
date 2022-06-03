import { orchestrate } from './orchestration/orchestrate';

export function hydrate(svg) {
    if (!svg) return;
    if (!Array.isArray(svg)) svg = [svg];
    
    svg = svg.map(d => typeof d === 'string' ? document.querySelector(d) : d);
    if (svg) orchestrate(svg);
}
