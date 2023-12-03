import { LINK_TYPES } from '../orchestration/link.js';

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
