import { escape, query } from "arquero";

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
    for (const [field, predicate] of Object.entries(predicates)) {
        const { value, type } = predicate;
        if (type === SELECT_TYPE.POINT) {
            return query().filter(escape(d => d[field] === value)).reify();
        }
    }
}

export function generatePredicates(field, object, type) {
    if (type === SELECT_TYPE.POINT) {
        return { [field]: { value: object[field], type: type } };
    } else {
        console.log('TODO');
    }
}
