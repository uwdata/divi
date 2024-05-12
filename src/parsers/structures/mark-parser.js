import { MarkRole, RoleProperty } from '../../state/constants.js';
import { sortByViewPos } from '../../util/util.js';

export function inferMarks(state) {
    state.svgMarks = state.svgMarks.filter(d => !d[RoleProperty]);
    state.svgMarks.forEach(d => { d[RoleProperty] = MarkRole; });
    sortByViewPos(null, state.svgMarks, false);
}
