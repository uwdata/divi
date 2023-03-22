import { escape, op, query, table } from "arquero";
import { range } from "d3-array";
import { COMMAND_TYPE, generateQuery } from "../handlers/query";
import { SizeLegend, tableGroupIndexField, tableIndexField, tableMarkField } from "../state/constants";

const epsilon = 2;
export const AGGREGATIONS = {
    COUNT: 'count',
    MIN: 'min',
    MAX: 'max',
    MEAN: 'mean',
    SUM: 'sum'
}

export const LINK_TYPES = {
    NONE: 0,
    DIRECT: 1,
    SUBSET: 2,
    AGGREGATE: 3
}

function isEqual(val1, val2, ep=epsilon) {
    return typeof val1 === 'string'
        ? val1 === val2
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

function getFields(table, useMeta=false) {
    const metaFields = [tableMarkField, tableIndexField, tableGroupIndexField];
    return useMeta ? table.columnNames() : table.columnNames(d => !metaFields.includes(d));
}

function LinkIterator(sourceTable, targetTable, candidateBins, epsilons) {
    function linker() { }

    linker.exists = function(link) {
        return link && Object.keys(link).length;
    }

    linker.direct = function() {
        const link = getDirectLinks(sourceTable, targetTable);
        return { link: link, type: linker.exists(link) ? LINK_TYPES.DIRECT : LINK_TYPES.NONE };
    }

    linker.subset = function() {
        return { type: LINK_TYPES.NONE }
        const link = getSubsetLinks(sourceTable, targetTable, [], [], [], [], []);
        return { link: link, type: linker.exists(link) ? LINK_TYPES.SUBSET : LINK_TYPES.NONE };
    }

    linker.aggregate = function() {
        return { type: LINK_TYPES.NONE }
        const link = getAggregateLinks(sourceTable, targetTable, [], []);
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

    function getIndexMap(tableA, tableB, sortA, sortB, subsetIndices=null) {
        let A = tableA.orderby(sortA).array(tableIndexField);
        if (subsetIndices) A = A.filter((_, i) => subsetIndices.includes(i));
        const B = tableB.orderby(sortB).array(tableIndexField); // All rows must already be present

        const _fromToMap = Object.fromEntries(A.map((a, i) => [a, B[i]]));
        const _toFromMap = Object.fromEntries(B.map((b, i) => [b, A[i]]));

        if (subsetIndices) {
            const newCols = getFields(tableA).filter(d => !sortA.includes(d));
            const _table = tableA.orderby(sortA).filter(escape(d => A.includes(d[tableIndexField]))).select(newCols);
            var mergedTable = tableB.orderby(sortB).assign(_table).orderby(tableIndexField).reify();
        }

        return { 
            map: {
                fromToMap: _fromToMap, 
                toFromMap: _toFromMap, 
                mergedTable: mergedTable
            }
        };
    }

    function getAggregateQueries(groupBy, groupByTable, rollupObj) {
        const groupKeys = Array.from(groupByTable._group.keys);
        const fromToQ = query().groupby([...groupBy, tableIndexField]).rollup(rollupObj);
        const toFromQ = query().groupby(groupBy).derive(rollupObj);
        
        return { fromToQuery: fromToQ, toFromQuery: toFromQ, assignTable: table({ [tableGroupIndexField]: groupKeys }) };
    }

    function getDirectLinks(tableA, tableB) {
        const fieldsA = getFields(tableA);
        const fieldsB = getFields(tableB);

        if (!fieldsA.length || !fieldsB.length /*|| fieldsA.length !== fieldsB.length*/) return null;
        
        const directLinks = { };
        const foundIndices = [];
        const sortA = [], sortB = [];
        for (let j = 0; j < fieldsB.length && Object.keys(directLinks).length < fieldsA.length 
            && Object.keys(directLinks).length < fieldsB.length; ++j) {
                tableB = tableB.orderby(sortB.length ? sortB : fieldsB[j]);
                let found = false;

                for (let i = 0; i < fieldsA.length && Object.keys(directLinks).length < fieldsA.length 
                    && Object.keys(directLinks).length < fieldsB.length; ++i) {
                        // console.log(fieldsB[j], fieldsA[i])
                        if (foundIndices.includes(i)) continue;

                        tableA = tableA.orderby(sortA.length ? sortA : fieldsA[i]);
                        const dataA = tableA.array(fieldsA[i]);
                        const dataB = tableB.array(fieldsB[j]);

                        if (isDirectLink(dataA, dataB, epsilons[fieldsB[j]] ? epsilons[fieldsB[j]] : epsilon)) {
                            directLinks[fieldsA[i]] = fieldsB[j];
                            found = true;
                            foundIndices.push(i);
                            sortA.push(fieldsA[i]);
                            sortB.push(fieldsB[j]);
                            break;
                        }
                }

                if (!found) return null;
        }
        console.log(directLinks)
        return { fields: directLinks, ...getIndexMap(tableA, tableB, sortA, sortB) };
    }

    function getSubsetLinks(tableA, tableB, usedFieldsA, usedFieldsB, indices, sortA, sortB) {
        const fieldsA = getFields(tableA).filter(d => !usedFieldsA.includes(d));
        const fieldsB = getFields(tableB).filter(d => !usedFieldsB.includes(d));
        
        if (!fieldsA.length || !fieldsB.length || fieldsA.length < fieldsB.length) {
            return !indices.length ? { } : getIndexMap(tableA, tableB, sortA, sortB, indices[0]);
        }
        
        for (let j = 0; j < fieldsB.length; ++j) {
            tableB = tableB.orderby([...sortB, fieldsB[j]]);

            for (let i = 0; i < fieldsA.length; ++i) {
                tableA = tableA.orderby([...sortA, fieldsA[i]]);

                const dataA = tableA.array(fieldsA[i]);
                const dataB = tableB.array(fieldsB[j]);

                const [sourceI, targetI] = getSubset(dataA, dataB, epsilons[fieldsB[j]] ? epsilons[fieldsB[j]] : epsilon);
                const [prevSourceI, prevTargetI] = indices.length ? indices : [sourceI, targetI];
                
                if (targetI.length !== tableB.numRows() || !isDirectLink(prevSourceI, sourceI) 
                    || !isDirectLink(prevTargetI, targetI)) continue;

                const subsets = getSubsetLinks(
                    tableA, tableB, 
                    [...usedFieldsA, fieldsA[i]], [...usedFieldsB, fieldsB[j]],
                    [prevSourceI, prevTargetI],
                    [...sortA, fieldsA[i]], [...sortB, fieldsB[j]]
                );
                if (subsets) return {...subsets, fields: {...subsets.fields, [fieldsA[i]]: fieldsB[j]}};
            }
        }

        return null;
    }

    function getAggregateLinks(tableA, tableB, groupBy, processedFields) {
        const fieldsA = getFields(tableA);
        const fieldsB = getFields(tableB);
        // G, A, P, D <-> G, A, P, D subject to domain / statistic constraints (min, max, mean -> range for numeric & date / unique for string, count -> number of rows, sum -> sum of int columns)

        if (fieldsA.length < fieldsB.length || tableA.numRows() <= tableB.numRows() || groupBy.length > 2) return null;
        
        for (let i = 0; i < fieldsA.length; ++i) {
            if (processedFields.includes(fieldsA[i])) continue;
            console.log(groupBy, fieldsA[i], groupBy, processedFields)
            const q = query().groupby(groupBy);

            for (const [aggName, aggFn] of Object.entries(AGGREGATIONS)) {
                const rollupObj = { [aggName + '-' + fieldsA[i]]: op[aggFn](fieldsA[i]) };
                const groupByTable = q.evaluate(tableA);
                let rollupTable = groupByTable.rollup(rollupObj);
                rollupTable = rollupTable.assign(table({ [tableIndexField]: range(rollupTable.numRows()) }));

                const directLinks = getDirectLinks(rollupTable, tableB, true);
                if (directLinks && Object.keys(directLinks).length) {
                    return { aggregation: getAggregateQueries(groupBy, groupByTable, rollupObj), ...directLinks };
                } 
            }

            const newGroups = [fieldsA[i]]
            // const newGroups = typeof tableA.column(fieldsA[i]).get(0) === 'string' 
                // ? [fieldsA[i]] 
                // : candidateBins.map(function(b) { 
                    // return { [fieldsA[i]]: escape(d => (op.bin(d[fieldsA[i]], ...b) + b[2] / 2)) }; 
                // });

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

    return [yBins];
}

function getEpsilons(state) {
    const epsilons = { }, epsilon = 0.01;
    const { xAxis, yAxis, legends } = state;
    const { domain: xDomain } = xAxis;
    const { domain: yDomain } = yAxis;

    if (!xAxis.ordinal.length) {
        // let tmp = Math.abs(xDomain[1] - xDomain[0]) * epsilon;
        // if (xAxis.formatter) tmp = {epsilon: tmp, format: xAxis.formatter.format };
        
        epsilons[xAxis.title.innerHTML.toLowerCase()] = Math.abs(xDomain[1] - xDomain[0]) * epsilon;
    } 
    if (!yAxis.ordinal.length) {
        // let tmp = Math.abs(yDomain[1] - yDomain[0]) * epsilon;
        // if (yAxis.formatter) tmp = {epsilon: tmp, format: yAxis.formatter.format };

        epsilons[yAxis.title.innerHTML.toLowerCase()] = Math.abs(yDomain[1] - yDomain[0]) * epsilon;
    }

    for (const legend of legends) {
        if (legend.type === SizeLegend) {
            const { scale } = legend;
            const sDomain = scale.domain();
            epsilons[legend.title.innerHTML.toLowerCase()] = Math.abs(sDomain[0] - sDomain[sDomain.length - 1]) * epsilon;
        }
    }
    
    return epsilons;
}

function storeLink(type, link, to, from, storeTable=false) {
    const { aggregation, fields, map } = link;
    const { fromToMap, toFromMap, mergedTable } = map;
    const { fromToQuery, toFromQuery, assignTable } = aggregation;

    const fromToLink = { type: type, next: to, map: fromToMap, fields: fields};
    const toFromLink = { type: type, next: from, map: toFromMap, fields: invertFields(fields) };

    if (type === LINK_TYPES.DIRECT || type === LINK_TYPES.SUBSET) {
        from.children.push(fromToLink);
        to.children.push(toFromLink);

        if (storeTable && type === LINK_TYPES.SUBSET) to.table = mergedTable;
    } else {
        from.children.push({ ...fromToLink, aggregation: { query: fromToQuery, assignTable: assignTable } });
        to.parents.push({ ...toFromLink, aggregation: { query: toFromQuery, assignTable: assignTable } });
    } 
}

function linkExternalDatasets(states, extState) {
    const { table: extTable } = extState;
    if (!extTable) return;

    for (const state of states) {
        const { data } = state;
        if (!data.table) continue;

        const linker = LinkIterator(extTable, data.table, null, getEpsilons(state));
        const { type: dType } = linker.direct();
        if (dType === LINK_TYPES.DIRECT) return; // Relegate direct linkings to views

        const {type: sType, link} = linker.subset();
        const candidates = [];
        if (sType === LINK_TYPES.SUBSET) {
            data.table = link.map.mergedTable;
            if (extTable.numRows() === data.table.numRows()) return; // Relegate newly formed direct linkings to views
            candidates.push([sType, link, data]);
        }

        candidates.forEach(d => storeLink(...d, extState));
    }

    for (const state of states) {
        const { data } = state;
        if (!data.table) continue;

        const { type, link } = LinkIterator(extTable, data.table, getBins(state), getEpsilons(state)).aggregate();
        if (type === LINK_TYPES.AGGREGATE) storeLink(type, link, data, extState);
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

            const { type: fType, link: fLink } = LinkIterator(
                _d1.table, _d2.table, getBins(states[i]), getEpsilons(states[j])
            ).getLink();
            if (fType !== LINK_TYPES.NONE) {
                storeLink(fType, fLink, _d2, _d1, true);
            } else {
                const { type: bType, link: bLink } = LinkIterator(
                    _d2.table, _d1.table, getBins(states[j]), getEpsilons(states[i])
                ).getLink();
                if (bType !== LINK_TYPES.NONE)  {
                    storeLink(bType, bLink, _d1, _d2, true);
                }
            }
        }
    }
}

export function link(states, extState) {
    linkExternalDatasets(states, extState);
    linkCharts(states);
}

function invertFields(fields) {
    return Object.fromEntries(Object.keys(fields).map(k => [fields[k], k]));
}

function applyMap(_map, values) {
    return values.map(v => _map[v]);
}

function propagateFields(fieldMap, newFields) {
    return Object.fromEntries(
        Object.keys(fieldMap).filter(k => k in newFields).map(k => [newFields[k], fieldMap[k]])
    );
}

function propagateFieldValues(fieldMap, fields) {
    return Object.fromEntries(Object.keys(fieldMap).map(k => k in fields ? [k, fields[k]] : [k, fieldMap[k]]));
}

function propagateAggregation(node, aggregations) {
    let { table: _table } = node;
    for (const [aggregation, map] of aggregations) {
        const { query } = aggregation;
        _table = query.evaluate(_table);

        const groupKeys = applyMap(invertFields(map), Array.from(_table._group.keys)).map(d => Number(d));
        _table = _table.assign(table({ [tableGroupIndexField]: groupKeys }));
    }

    return _table.ungroup();
}

function removeDuplicateRows(_table) {
    return _table;
}

function propagateMapSelection(source, target, _map) {
    const indices = source.array(tableIndexField).map(i => _map[i]);
    return [source.assign({ [tableIndexField]: indices }), target.filter(escape(d => indices.includes(d[tableIndexField]))).reify()];
}

export function walkQueryPath(roots, rootPredicates, append=false) {
    function walkDownPath(node, data) {
        const { active, table: TABLE } = node;
        active.selected = data;

        const { children } = node;
        for (const child of children) {
            const { next, map, aggregation, fields, type } = child;
            let NEXT_TABLE = next.table, _data;
            next.active.type = type;

            if (aggregation) {
                const { query, assignTable } = aggregation;
                const idMap = Object.fromEntries(TABLE.array(tableIndexField).map(d => [d, d]));

                [, _data] = propagateMapSelection(data, TABLE.assign(assignTable), idMap);
                _data = query.evaluate(_data.rename({ [tableGroupIndexField]: tableIndexField }));

                [_data, NEXT_TABLE] = propagateMapSelection(_data, NEXT_TABLE, map);
                NEXT_TABLE = NEXT_TABLE.orderby(tableIndexField).assign(
                    _data.rename(fields).orderby(tableIndexField)
                ).unorder();
            } else {
                if (rootQuery) data = rootQuery.evaluate(data);
                NEXT_TABLE = propagateMapSelection(data, NEXT_TABLE, map);
            }

            walkDownPath(next, NEXT_TABLE);
        }
    }

    function clearPath(node) {
        const { active, children } = node;
        active.selected = active.table;

        for (const child of children) {
            const { next } = child;
            next.active.type = LINK_TYPES.NONE;
            clearPath(next);
        }
    }

    for (const root of roots) {
        const [node, startTable, fieldMap] = root;
        if (rootPredicates) {
            rootPredicates = propagateFields(rootPredicates, fieldMap);
        
            if (getFields(startTable, true).includes(tableGroupIndexField) && tableIndexField in rootPredicates) {
                rootPredicates[tableGroupIndexField] = rootPredicates[tableIndexField];
                delete rootPredicates[tableIndexField];
            }
    
            const _query = generateQuery(rootPredicates);
            let _table = _query.evaluate(startTable);
            if (append) _table = removeDuplicateRows(node.active.selected.concat(_table));
            walkDownPath(node, _table);
        } else {
            clearPath(node);
        }
    }
}

export function getRootNodes(startNode) {
    function walkUpPath(node, aggregations, fieldMap) {
        if (visited.has(node)) return [];
        visited.set(node, true);

        const { parents } = node;
        if (!parents.length) {
            return [[node, aggregations, fieldMap]];
        }

        let paths = [];
        for (const parent of parents) {
            const { next, aggregation, map, fields } = parent;
            paths = [...paths, ...walkUpPath(next, [...aggregations, [aggregation, map]], propagateFieldValues(fieldMap, fields))];
        }

        return paths;
    } 

    const visited = new WeakMap(), startFields = Object.fromEntries(getFields(startNode.table, true).map(c => [c, c]));
    const roots = walkUpPath(startNode, [], startFields);
    return roots.map(([root, aggregations, fieldMap]) => [root, propagateAggregation(root, aggregations), fieldMap]);
}
