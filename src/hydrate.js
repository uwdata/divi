import { zoom } from './zoom.js';
import { brush } from './brush.js';
import { filter } from './filter.js';
import { sort } from './sort.js';
import { select } from './select.js';
import { hover } from './hover.js';
import { inspect } from './inspect.js';

export function hydrate(id) {
    const svg = inspect(document.querySelector(id));
}
