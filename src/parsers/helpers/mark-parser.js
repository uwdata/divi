import { MarkRole, RoleProperty } from '../../state/constants.js';
import { flattenRGB, sortByViewPos } from '../../util/util.js';

export function inferMarks(state) {
    state.svgMarks = state.svgMarks.filter(d => !d[RoleProperty]);
    state.svgMarks = state.svgMarks.filter(d => flattenRGB(window.getComputedStyle(d).fill) !== 255 * 3); // Ignore white fill marks.
    state.svgMarks.forEach(d => { d[RoleProperty] = MarkRole; });
    sortByViewPos(null, state.svgMarks, false);
}
