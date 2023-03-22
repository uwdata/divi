import { LINK_TYPES } from "../orchestration/link";

export class DataState {
    constructor(table) {
        this.table = table;
        this.active = {
            table: table,
            selected: table,
            filtered: null,
            type: LINK_TYPES.NONE
        };
        this.children = []; 
        this.parents = [];
    }
}