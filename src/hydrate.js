import { orchestrate } from './orchestration/orchestrate';

export function hydrate(svg) {
    if (typeof svg === "string") svg = document.querySelector(svg);
    if (svg) orchestrate(svg);
}
