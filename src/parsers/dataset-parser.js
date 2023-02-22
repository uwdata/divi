import { loadCSV, loadJSON, table } from "arquero";
import { map, range } from "d3-array";
import { tableIndexField, tableMarkField } from "../state/constants";
import { DataState } from "../state/data-state";

export async function parseDataset(options) {
    if (!options || !Object.keys(options).length) return { };
    const { url } = options;
    const type = url.split('.').pop();
    const _table = await (type === 'json' ? loadJSON(url) : loadCSV(url));

    return new DataState(_table.assign(table({ [tableIndexField]: range(_table.numRows()) })));
}

export function parseDataFromMarks(marks) {
    const dataset = { };
    const dataList = marks.map(d => d.__inferred__data__);
    const keys = Object.keys(dataList[0]);

    marks.forEach((d, i) => d.__i = i);
    keys.forEach(k => dataset[k.toLocaleLowerCase()] = map(dataList, d => d[k.toLowerCase()]));
    dataset[tableMarkField] = marks;
    dataset[tableIndexField] = range(marks.length);

    return new DataState(table(dataset));
}
