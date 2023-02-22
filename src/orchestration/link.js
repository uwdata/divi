import { escape, op, query, table } from "arquero";
import { range } from "d3-array";
import { tableIndexField, tableMarkField } from "../state/constants";

const epsilon = 0;
export const AGGREGATIONS = {
    COUNT: 'count',
    MIN: 'min',
    MAX: 'max',
    MEAN: 'mean',
    SUM: 'sum'
}

const LINK_TYPES = {
    NONE: 0,
    DIRECT: 1,
    SUBSET: 2,
    AGGREGATE: 3
}

function isEqual(val1, val2, ep=epsilon) {
    return typeof val1 === 'string'
        ? val1 === val2 
        : isNaN(parseInt(val1))
        ? Math.abs(val1 - val2) / (1000 * 3600 * 24) <= ep
        : Math.abs(val1 - val2) <= ep;
}

function isDirectLink(source, target, ep=epsilon) {
    if (!source.length || !target.length || source.length !== target.length) return false;
    return range(source.length).filter(i => isEqual(source[i], target[i], ep)).length === source.length;
}

function getSubset(source, target, ep=epsilon) {
    const sourceIndices = [], targetIndices = [];
    let i = 0, j = 0;
    while (i < source.length) {
        if (isEqual(source[i], target[j], ep)) {
            sourceIndices.push(i);
            targetIndices.push(j++);
        } 
        ++i;
    }
    return [sourceIndices, targetIndices];
}

function LinkIterator(sourceTable, targetTable, candidateBins) {
    function getFields(table) {
        const metaFields = [tableMarkField, tableIndexField];
        return table.columnNames(d => !metaFields.includes(d));
    }

    function linker() { }

    linker.exists = function(link) {
        return link && Object.keys(link).length;
    }

    linker.direct = function() {
        const link = getDirectLinks(sourceTable, targetTable);
        return { link: link, type: linker.exists(link) ? LINK_TYPES.DIRECT : LINK_TYPES.NONE };
    }

    linker.subset = function() {
        const link = getSubsetLinks(sourceTable, targetTable, [], [], [], [], []);
        return { link: link, type: linker.exists(link) ? LINK_TYPES.SUBSET : LINK_TYPES.NONE };
    }

    linker.aggregate = function() {
        const link = getAggregateLinks(sourceTable, targetTable, [], [], []);
        return { link: link, type: linker.exists(link) ? LINK_TYPES.AGGREGATE : LINK_TYPES.NONE };
    }

    linker.getLink = function() {
        const direct = linker.direct();
        if (direct.type === LINK_TYPES.DIRECT) return direct;

        const subset = linker.subset();
        if (subset.type === LINK_TYPES.SUBSET) return subset;

        const aggregate = linker.aggregate();
        if (aggregate.type === LINK_TYPES.AGGREGATE) return aggregate;

        return { type: LINK_TYPES.NONE };
    }

    function appendFromTable(source, target, sSort, tSort, sIndices) {
        const A = source.orderby(sSort).array(tableIndexField).filter((_, i) => sIndices.includes(i));
        const B = target.orderby(tSort).array(tableIndexField); // All rows must already be present

        const _mFrom = Object.fromEntries(A.map((a, i) => [a, B[i]]));
        const _mTo = Object.fromEntries(B.map((b, i) => [b, A[i]]));

        const newCols = getFields(source).filter(d => !sSort.includes(d));
        const _table = source.orderby(sSort).filter(escape(d => A.includes(d[tableIndexField]))).select(newCols);

        return {
            mapFrom: _mFrom, 
            mapTo: _mTo, 
            tableFrom: target.orderby(tSort).assign(_table).orderby(tableIndexField).reify()
         };
    }

    function getDirectLinks(tableA, tableB, ep=2) {
        const fieldsA = getFields(tableA);
        const fieldsB = getFields(tableB);

        if (!fieldsA.length || !fieldsB.length || fieldsA.length !== fieldsB.length) return null;

        const directLinks = { };
        const foundIndices = [];
        const sortA = [], sortB = [];
        for (let i = 0; i < fieldsA.length && Object.keys(directLinks).length < fieldsA.length 
            && Object.keys(directLinks).length < fieldsB.length; ++i) {
                tableA = tableA.orderby(sortA.length ? sortA : fieldsA[i]);
                let found = false;

                for (let j = 0; j < fieldsB.length && Object.keys(directLinks).length < fieldsA.length 
                    && Object.keys(directLinks).length < fieldsB.length; ++j) {
                        if (foundIndices.includes(j)) continue;

                        tableB = tableB.orderby(sortB.length ? sortB : fieldsB[j]);
                        const dataA = tableA.array(fieldsA[i]);
                        const dataB = tableB.array(fieldsB[j]);

                        if (isDirectLink(dataA, dataB, ep)) {
                            directLinks[fieldsA[i]] = fieldsB[j];
                            found = true;
                            foundIndices.push(j);
                            sortA.push(fieldsA[i]);
                            sortB.push(fieldsB[j]);
                            break;
                        }
                }

                if (!found) return null;
        }

        return directLinks;
    }

    function getSubsetLinks(tableA, tableB, usedFieldsA, usedFieldsB, indices, sortA, sortB) {
        const fieldsA = getFields(tableA).filter(d => !usedFieldsA.includes(d));
        const fieldsB = getFields(tableB).filter(d => !usedFieldsB.includes(d));
        
        if (!fieldsA.length || !fieldsB.length || fieldsA.length < fieldsB.length) {
            return !indices.length ? { } : appendFromTable(tableA, tableB, sortA, sortB, indices[0]);
        }
        
        for (let j = 0; j < fieldsB.length; ++j) {
            tableB = tableB.orderby([...sortB, fieldsB[j]]);

            for (let i = 0; i < fieldsA.length; ++i) {
                tableA = tableA.orderby([...sortA, fieldsA[i]]);

                const dataA = tableA.array(fieldsA[i]);
                const dataB = tableB.array(fieldsB[j]);
                
                const [sourceI, targetI] = getSubset(dataA, dataB, 2);
                const [prevSourceI, prevTargetI] = indices.length ? indices : [sourceI, targetI];

                if (targetI.length !== tableB.numRows() || !isDirectLink(prevSourceI, sourceI) 
                    || !isDirectLink(prevTargetI, targetI)) continue;

                const subsets = getSubsetLinks(
                    tableA, tableB, 
                    [...usedFieldsA, fieldsA[i]], [...usedFieldsB, fieldsB[j]],
                    [prevSourceI, prevTargetI],
                    [...sortA, fieldsA[i]], [...sortB, fieldsB[j]]
                );
                if (subsets) return {...subsets, [fieldsA[i]]: fieldsB[j]};
            }
        }

        return null;
    }

    function getAggregateLinks(tableA, tableB, groupBy, processedFields) {
        const fieldsA = getFields(tableA);
        const fieldsB = getFields(tableB);

        if (fieldsA.length < fieldsB.length || tableA.numRows() <= tableB.numRows() || groupBy.length > 2) return null;
        
        for (let i = 0; i < fieldsA.length; ++i) {
            if (processedFields.includes(fieldsA[i])) continue;
            const q = query().groupby(groupBy);

            for (const [aggName, aggFn] of Object.entries(AGGREGATIONS)) {
                const gField = [aggName + '-' + fieldsA[i]];
                const _q = q.rollup({ [gField]: op[aggFn](fieldsA[i]) })
                const _table = _q.evaluate(tableA);
                
                const directLinks = getDirectLinks(_table, tableB, 2);
                if (directLinks && Object.keys(directLinks).length) {
                    return { query: _q, fields: directLinks };
                } 
            }

            const newGroups = typeof tableA.column(fieldsA[i]).get(0) === 'string' 
                ? [fieldsA[i]] 
                : candidateBins.map(function(b) { 
                    return { [fieldsA[i]]: escape(d => (op.bin(d[fieldsA[i]], ...b) + b[2] / 2)) }; 
                });

            for (const newGroup of newGroups) {
                const link = getAggregateLinks(tableA, tableB, [...groupBy, newGroup], [...processedFields, fieldsA[i]]);
                if (link) return link;
            }
        }
    }

    return linker;
}

function getBins(state) {
    function bin(scale, ticks) {
        const domain = scale.domain();
        const stepSize = Math.abs(domain[0] - domain[1]) / (ticks.length - 1);

        return [...domain, stepSize];
    }

    const { xAxis, yAxis } = state;
    const { scale: xScale, ticks: xTicks, ordinal: xOrdinal} = xAxis;
    const { scale: yScale, ticks: yTicks, ordinal: yOrdinal } = yAxis;

    const xBins = xOrdinal.length ? [] : bin(xScale, xTicks);
    const yBins = yOrdinal.length ? [] : bin(yScale, yTicks);

    return [xBins, yBins];
}

function storeLink(_link, to, from) {
    const { type } = _link;
    const fromLink = { next: to, ..._link };
    const toLink = { next: from, ..._link };

    if (type === LINK_TYPES.DIRECT || type === LINK_TYPES.SUBSET) {
        from.children.push(toLink);
        to.children.push(fromLink);
    } else {
        from.children.push(toLink);
        to.parents.push(fromLink);
    } 
}

function linkExternalDatasets(states, extState) {
    const { table: extTable } = extState;
    if (!extTable) return;

    for (const state of states) {
        const { data } = state;
        if (!data.table) continue;

        const linker = LinkIterator(extTable, data.table);
        const { type: dType } = linker.direct();
        if (dType === LINK_TYPES.DIRECT) return; // Relegate direct linkings to views

        const {type: sType, link} = linker.subset();
        const candidates = [];
        if (sType === LINK_TYPES.SUBSET) {
            data.table = link.tableFrom;
            if (extTable.numRows() === data.table.numRows()) return; // Relegate newly formed direct linkings to views
            candidates.push([link, data]);
        }

        candidates.forEach(d => storeLink(...d, extState));
    }

    for (const state of states) {
        const { data } = state;
        if (!data.table) continue;

        const { type, link } = LinkIterator(extTable, data.table, getBins(state)).aggregate();
        if (type === LINK_TYPES.AGGREGATE) storeLink(link, data, extState);
    }

    return;
}

function linkCharts(states) {
    for (let i = 0; i < states.length; ++i) {
        const { data: _d1 } = states[i];
        if (!_d1.table) continue;

        for (let j = i + 1; j < states.length; ++j) {
            const { data: _d2 } = states[j];
            if (!_d2.table) continue;

            const { type: fType, link: fLink } = LinkIterator(_d1.table, _d2.table, getBins(states[i])).getLink();
            if (fType !== LINK_TYPES.NONE) {
                storeLink(fLink, _d2, _d1);
            } else {
                const { type: bType, link: bLink } = LinkIterator(_d2.table, _d1.table, getBins(states[j])).getLink();
                if (bType !== LINK_TYPES.NONE)  {
                    storeLink(bLink, _d1, _d2);
                }
            }
        }
    }
}

export function link(states, extState) {
    linkExternalDatasets(states, extState);
    linkCharts(states);
}
