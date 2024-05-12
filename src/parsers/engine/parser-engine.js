import { inferAxes } from '../structures/axis-parser.js';
import { collectCandidateMarkGroups } from './parser-helpers.js';
import { inferLegends } from '../structures/legend-parser.js';
import { inferMarks } from '../structures/mark-parser.js';
import { inferTitles } from '../structures/text-parser.js';
// import { selectAll } from 'd3-selection';

export function parseChart(state) {
    const { textMarks, svgMarks } = state;

    let [candidateTextMarkGroups, candidateTickMarkGroups, candidateLegendMarkGroups] = collectCandidateMarkGroups(textMarks, svgMarks);
    const axes = inferAxes(state, candidateTextMarkGroups, candidateTickMarkGroups);

    // Remove axis text marks prior to legend inference.
    candidateTextMarkGroups = candidateTextMarkGroups.filter(d => !axes.map(a => a.text).includes(d.marks));
    const legends = inferLegends(state, candidateTextMarkGroups, candidateLegendMarkGroups);

    // Remove legend text marks prior to mark and title inference.
    candidateTextMarkGroups = candidateTextMarkGroups.filter(d => !legends.map(l => l.text).includes(d.marks));
    inferMarks(state);
    inferTitles(state, candidateTextMarkGroups.map(d => d.marks).flat());
}
