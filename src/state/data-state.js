import { LINK_TYPES } from "../orchestration/link";

export class DataState {
    constructor(table) {
        this.table = table;
        this.active = {
            table: null,
            selected: null,
            filtered: null,
            type: LINK_TYPES.NONE
        };
        this.children = []; 
        this.parents = [];
    }
}