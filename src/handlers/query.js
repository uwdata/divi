import { escape, query } from 'arquero';

export const COMMAND_TYPE = {
    SELECT: 0,
    APPEND: 1,
    FILTER: 2
};

export const SELECT_TYPE = {
    POINT: 0,
    RANGE: 1
};

export function generateQuery(predicates) {
    const queries = [];
    for (const predicate of predicates) {
        const field = Object.keys(predicate)[0];
        const { value, cond, type } = predicate[field];
        let q;

        if (type === SELECT_TYPE.POINT) {
            q = query().filter(escape(d => d[field] === value)).reify();
        } else if (type === SELECT_TYPE.RANGE) {
            q = query().filter(escape(d => {
                return (cond === '>=' ? d[field] >= value : d[field] <= value);
            })).reify();
        }
        queries.push(q);
    }
    return queries;
}

export function generatePredicates(field, object, type) {
    if (type === SELECT_TYPE.POINT) {
        return [{ [field]: { value: object[field], type } }];
    } else {
        console.log('TODO');
    }
}

export function generateBrushPredicates(field1, field2, xR, yR) {
    return [
        { [field1]: { value: xR[0], cond: '>=', type: SELECT_TYPE.RANGE } },
        { [field1]: { value: xR[1], cond: '<=', type: SELECT_TYPE.RANGE } },
        { [field2]: { value: yR[0], cond: '<=', type: SELECT_TYPE.RANGE } },
        { [field2]: { value: yR[1], cond: '>=', type: SELECT_TYPE.RANGE } }
    ];
}
