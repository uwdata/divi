import { mean } from 'd3-array';
import { CenterX, CenterY, RoleProperty, TitleRole } from '../../state/constants.js';

export function inferTitles(state, titles) {
    const titleAssignment = new Map();

    function calculatePos(el) {
        const elBBox = el.getBBoxCustom();
        return [elBBox[CenterX], elBBox[CenterY]];
    }

    function getClosestTitle(x, y) {
        let closestTitle = { title: null, dist: Number.MAX_SAFE_INTEGER };
        for (const title of titles) {
            const [titleX, titleY] = calculatePos(title);
            const posDiff = Math.abs(titleX - x) + Math.abs(titleY - y);

            if (posDiff < closestTitle.dist) {
                closestTitle = { title, dist: posDiff };
            }
        }

        return closestTitle;
    }

    const groups = [state.xAxis, state.yAxis, ...state.legends];
    for (const group of groups) {
        const _g = 'ticks' in group ? group.ticks : group.marks;
        const pos = _g.filter(d => d.label).map(mark => calculatePos(mark.label));
        const x = mean(pos.map(d => d[0])); const y = mean(pos.map(d => d[1]));

        const titleGroup = getClosestTitle(x, y);
        const { title, dist } = titleGroup;
        if (!title) continue;

        if (!titleAssignment.has(title) || dist < titleAssignment.get(title).dist) {
            group.title = title;
            title[RoleProperty] = TitleRole;
            titleAssignment.set(title, titleGroup);
        }
    }

    state.title = titles.filter(d => !d[RoleProperty])[0];
}
