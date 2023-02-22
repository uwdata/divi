export class DataState {
    constructor(table) {
        this.table = table;
        this.activeTable = null;
        this.children = []; 
        this.parents = [];
    }
}