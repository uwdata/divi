import { max, min } from 'd3-array';
import { CenterX, CenterY, horizAlign, vertAlign } from '../../state/constants.js';

// Generate shared list of marks' pixel positions (e.g., left pixel value, right pixel value, etc.).
/* E.g.,
    [
        left: [
            [23, mark1], [23, mark2], [50, mark3], ...
        ],
        ...
    ]
*/
function generatePositionArrays(marks, useCenters = true) {
    const positionArrays = { left: [], right: [], top: [], bottom: [] };
    if (useCenters) {
        positionArrays[CenterX] = [];
        positionArrays[CenterY] = [];
    }

    for (const mark of marks) {
        const bbox = mark.getBBoxCustom();
        for (const [position, markArray] of Object.entries(positionArrays)) {
            const pixelOffset = bbox[position];
            markArray.push([pixelOffset, mark]);
        }
    }

    return positionArrays;
}

// Merge shared pixel positions.
/* E.g.,
    [
        left: [
            [23, mark1], [23, mark2], [50, mark3]], ...
        ],
        ...
    ]
    -->
    [
        left: [
            [mark1, mark2], [mark3], ...
        ],
        ...
    ]
*/
function mergePositions(positionArrays, useStyle = false) {
    function mergeArray(array) { // Assumes [key, mark] structure.
        array.sort((a, b) => a[0] - b[0]);
        const groups = [[array[0][0], [array[0][1]]]];

        for (let i = 1; i < array.length; ++i) {
            const index = groups[groups.length - 1][0];

            const epsilon = 3;
            if (Math.abs(index - array[i][0]) < epsilon) {
                groups[groups.length - 1][1].push(array[i][1]);
            } else {
                groups.push([array[i][0], [array[i][1]]]);
            }
        }

        return groups.map(d => d[1]); // Project marks (remove pixel offset values).
    }

    const mergedPositions = [];
    if (useStyle) { // Only group aligned marks if they share similar style.
        const positions = [CenterX, CenterY];

        for (const position of positions) {
            const markArray = positionArrays[position];
            const styleArrays = { };

            markArray.forEach(([pixelOffset, mark]) => {
                const bbox = mark.getBBoxCustom();
                const style = window.getComputedStyle(mark);
                const styleKey = [bbox.width, bbox.height, style.fill, style.color, style.stroke].join(',');

                styleKey in styleArrays
                    ? styleArrays[styleKey].push([pixelOffset, mark])
                    : styleArrays[styleKey] = [[pixelOffset, mark]];
            });

            Object.values(styleArrays).forEach(d => mergedPositions.push([position, mergeArray(d)]));
        }
    } else {
        for (const [position, markArray] of Object.entries(positionArrays)) {
            mergedPositions.push([position, mergeArray(markArray)]);
        }
    }

    return mergedPositions;
}

// Identify mark groups based on shared pixel positions.
function assignGroups(marks, mergedPositions) {
    // Assign each text element to its largest found group
    const markAssignment = new Map();
    const alignmentMap = new Map();

    for (const [position, positionArray] of mergedPositions) {
        for (const markArray of positionArray) {
            for (const mark of markArray) {
                const assignment = markAssignment.get(mark);

                if (!assignment || markArray.length > assignment.length) {
                    markAssignment.set(mark, markArray);
                    alignmentMap.set(markArray, position);
                }
            }
        }
    }

    // Compute all candidate groups
    const candidateGroups = [];
    for (let i = 0; i < marks.length; ++i) {
        const markGroup = markAssignment.get(marks[i]);

        if (!candidateGroups.includes(markGroup)) {
            candidateGroups.push(markGroup);
        }
    }

    // Remove duplicates
    for (let i = 0; i < candidateGroups.length; ++i) {
        for (const mark of [...candidateGroups[i]]) {
            if (markAssignment.get(mark) !== candidateGroups[i]) {
                candidateGroups[i].splice(candidateGroups[i].indexOf(mark), 1);
            }
        }
    }

    return candidateGroups.map(d => {
        return { alignment: alignmentMap.get(d), marks: d };
    });
}

// Pair candidate text groups with candidate mark groups.
export function pairGroups(svg, candidateTextGroups, candidateMarkGroups, append = true) {
    // Sort by x (horizontally-aligned) or y (vertically-aligned) pixel position.
    function _sort(alignment, group) {
        group.sort((a, b) => {
            const aBox = a.getBBoxCustom(); const bBox = b.getBBoxCustom();
            return horizAlign.includes(alignment) ? aBox[CenterX] - bBox[CenterX] : aBox[CenterY] - bBox[CenterY];
        });
    }

    // Compute Euclidean distance between mean position of groups.
    function getGroupDistance(groupA, groupB) {
        const meansA = [0, 0];
        const meansB = [0, 0];

        function addVal(obj, mark, length) {
            const bbox = mark.getBBoxCustom();
            const keys = [CenterX, CenterY];
            for (let i = 0; i < keys.length; ++i) {
                obj[i] += bbox[keys[i]] / length;
            }
        }

        // Compute mean pixel values for both groups.
        groupA.forEach(d => addVal(meansA, d, groupA.length));
        groupB.forEach(d => addVal(meansB, d, groupB.length));

        return Math.sqrt((meansA[0] - meansB[0]) ** 2 + (meansA[1] - meansB[1]) ** 2);
    }

    // Try matching each candidate text element with a candidate tick element.
    function matchGroup(alignment, textGroup, tickGroup) {
        let i = 0;
        let distance = 0;
        const textMap = new Map();

        for (const text of textGroup) {
            const textBB = text.getBBoxCustom();
            let prevDist = Number.MAX_SAFE_INTEGER;

            // Exhausted candiate ticks, so return no match found.
            if (i === tickGroup.length) return [Number.MAX_SAFE_INTEGER, null];

            // Search candidate ticks.
            while (i <= tickGroup.length) {
                const tickBB = tickGroup[min([i, tickGroup.length - 1])].getBBoxCustom();
                const key = horizAlign.includes(alignment) ? CenterX : CenterY;
                const dist = Math.abs(tickBB[key] - textBB[key]);

                // Since tick marks are already sorted by position, exit once current distance exceeds prior distance.
                if (dist >= prevDist) {
                    textMap.set(text, tickGroup[i - 1]);
                    distance += prevDist;
                    break;
                }

                prevDist = dist;
                ++i;
            }
        }

        // Return average distance between each pair of matched text and tick marks.
        return [distance / textGroup.length, textMap];
    }

    const groups = [];
    const others = [];
    const epsilon = 5;
    const viewEpsilon = 1e-1 * max([svg.getBBoxCustom().width, svg.getBBoxCustom().height]);

    // Iterate over each text group to find a potential match with a mark group.
    for (const { alignment, marks: textGroup } of candidateTextGroups) {
        if (textGroup.length === 1) {
            others.push([alignment, textGroup]);
            continue;
        }

        let minGroup = { dist: Number.MAX_SAFE_INTEGER, group: null };
        _sort(alignment, textGroup);

        // For the given text group, iterate over all mark groups to identify the maximal match.
        for (const { alignment: markAlignment, marks: markGroup } of candidateMarkGroups) {
            // Can't match all text elements, so skip.
            if (markGroup.length < textGroup.length) continue;

            // Text group and mark group must share same alignment (e.g., left or top).
            if ((vertAlign.includes(alignment) && !vertAlign.includes(markAlignment)) ||
                (horizAlign.includes(alignment) && !horizAlign.includes(markAlignment))) continue;

            // Pre-emptively ignore text / mark groups that are too far apart.
            // This also helps reduce the search space.
            if (getGroupDistance(textGroup, markGroup) > viewEpsilon) continue;

            _sort(alignment, markGroup);
            const [_dist, textMap] = matchGroup(alignment, textGroup, markGroup);
            if (_dist === Number.MAX_SAFE_INTEGER) continue;

            // Ticks and gridlines in certain SVGs (e.g., ggplot2) may have close, but different, distances.
            // Use within-epsilon comparison to handle this
            const withinEp = Math.abs(_dist - minGroup.dist) < epsilon;
            if (append && withinEp) {
                minGroup.group.push([textMap, markGroup]);
            } else if ((!append && withinEp && markGroup.length < minGroup.group[0][1].length) || _dist < minGroup.dist) {
                // Create new minimum group if current matched mark group has fewer marks or distance is smaller.
                minGroup = { alignment, dist: _dist, group: [[textMap, markGroup]], text: textGroup };
            }
        }

        if (minGroup.group) groups.push(minGroup);
    }

    groups.sort((a, b) => a.dist - b.dist);
    return groups;
}

// Infer candidate groups for (1) text marks, (2) tick marks, and (3) legend marks.
export function collectCandidateMarkGroups(textMarks, svgMarks) {
    const markPositions = generatePositionArrays(svgMarks);
    const legendMarkGroups = mergePositions(markPositions).map(([k, v]) => v.map(d => { return { alignment: k, marks: d }; })).flat();
    const tickMarkGroups = assignGroups(svgMarks, mergePositions(markPositions, true));
    const textMarkGroups = assignGroups(textMarks, mergePositions(generatePositionArrays(textMarks, false)));

    return [textMarkGroups, tickMarkGroups, legendMarkGroups];
}
