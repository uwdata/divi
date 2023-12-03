// import { DataState } from './data-state';

export class ViewState {
    constructor() {
        this.hasDomain = false;
        this.svg = null;
        this.svgMarks = [];
        this.textMarks = [];
        this.data = null;

        this.xAxis = {
            domain: [null, null],
            ordinal: [],
            range: [null, null],
            ticks: [],
            scale: null,
            axis: null,
            title: null
        };
        this.yAxis = {
            domain: [null, null],
            ordinal: [],
            range: [null, null],
            ticks: [],
            scale: null,
            axis: null,
            title: null
        };

        this.legends = [];
        this.title = null;

        this.interactions = {
            selection: true,
            brush: true,
            navigate: false,
            filter: false,
            sort: false,
            annotate: false
        };
    }
}
