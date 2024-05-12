import { LINK_TYPES } from '../parsers/link-parsers.js';

export class DataState {
    constructor(table) {
        this.table = table;
        this.active = {
            table,
            selected: table,
            filtered: null,
            type: LINK_TYPES.NONE
        };
        this.children = [];
        this.parents = [];
    }
}
