import { INTERACTION_CONSTANTS } from "./constants";
// import { svg_objects } from "./inspect";

export function filter(condition) {
    console.log('filter');
    let [field, sep, val] = condition.split(" ");
    let unique_fields = Object.keys(svg_marks[0].__data__);

    for (const mark of svg_marks) {
        mark.style['visibility'] = 'visible';
    }

    if (!field || !sep || !val) {
        return;
    }
    
    if (!unique_fields.includes(field)) {
        return;
    }

    if (sep != "=" && sep != ">=" && sep != "<=" && sep != ">" && sep != "<" && sep != "!=") {
        return;
    }

    for (const mark of svg_marks) {
        switch(sep) {
            case "=":
                if (mark.__data__[field] == val) mark.style['visibility'] = 'visible';
                else mark.style['visibility'] = 'hidden'; console.log('hidden');
                break;
            case ">=":
                if (mark.__data__[field] >= val) mark.style['visibility'] = 'visible';
                else mark.style['visibility'] = 'hidden';
                break;
            case "<=":
                if (mark.__data__[field] <= val) mark.style['visibility'] = 'visible';
                else mark.style['visibility'] = 'hidden';
                break;
            case ">":
                if (mark.__data__[field] > val) mark.style['visibility'] = 'visible';
                else mark.style['visibility'] = 'hidden';
                break;
            case "<":
                if (mark.__data__[field] < val) mark.style['visibility'] = 'visible';
                else mark.style['visibility'] = 'hidden';
                break;
            case "!=":
                if (mark.__data__[field] != val) mark.style['visibility'] = 'visible';
                else mark.style['visibility'] = 'hidden';
                break;
        }
    }
}
