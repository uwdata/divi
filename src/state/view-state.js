export class ViewState {
    constructor() {
        this.hasDomain = false;
        this.svg = null;
        this.svgMarks = [];
        this.textMarks = [];
        this.axisTextMarks = [];

        this.xAxis = {
            domain: [null, null],
            ordinal: [],
            range: [null, null],
            ticks: [],
            scale: null,
            axis: null
        };
        this.yAxis = {
            domain: [null, null],
            ordinal: [],
            range: [null, null],
            ticks: [],
            scale: null,
            axis: null
        };
        
        this.legend = [];
        this.titles = {
            x: null,
            y: null
        };
        
        this.interactions = {
            selection: {
                control: null,
                active: false
            },
            zoom: {
                control: null,
                axisControl: null
            },
            pan: {
                control: null,
                axisControl: null,
                flag: false
            },
            brush: {
                control: null,
                axisControl: null,
                flag: true,
                active: false,
                on_elem: false
            },
            filter: {
                control: null,
                active: false
            },
            sort: {
                control: null
            },
            annotate: {
                flag: false
            },
            arrange: {
                flag: false
            }
        }
    }
}
