import { loadCSV, loadJSON, table } from 'arquero';
import { map, range } from 'd3-array';
import { DataAttr, tableIndexField, tableMarkField } from '../state/constants.js';
import { DataState } from '../state/data-state.js';

export async function parseDataset(options) {
    if (!options || !Object.keys(options).length) return { };
    const { url } = options;
    const type = url.split('.').pop();
    const _table = await (type === 'json' ? loadJSON(url) : loadCSV(url));

    return new DataState(_table.assign(table({ [tableIndexField]: range(_table.numRows()) })));
}

export function parseDataFromMarks(marks) {
    const dataset = { };
    let dataList = marks.map(d => d[DataAttr]);
    dataList = dataList.flat();
    const keys = Object.keys(dataList[0]);

    marks.forEach((d, i) => { d[tableIndexField] = i; });
    keys.forEach(k => { dataset[k.toLowerCase()] = map(dataList, d => d[k.toLowerCase()]); });
    dataset[tableMarkField] = marks;
    dataset[tableIndexField] = range(marks.length);

    return new DataState(table(dataset));
}
