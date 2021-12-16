class EventHandler {
    constructor(interaction_type) {
        this.interaction_type = interaction_type;
        this.svg_container = null;
        this.svg_groups = [];
        this.svg_marks = [];
        this.enabled_interactions = new Map();

        this.walk_svg(document.body);
        this.enable_interactions();
    }

    clear_svg() {
        this.svg_container = null;
        this.svg_groups = [];
        this.svg_marks = [];
    }

    walk_svg(el) {
        if (el == null) {
            return;
        }

        if (el.nodeName == SVG_TYPE.SVG_CONTAINER) {
            this.svg_container = el;
            if (!this.svg_container.hasAttribute("id")) {
                this.svg_container.setAttribute("id", "svg_plot");
            }
        }

        if (el.nodeName == SVG_TYPE.SVG_GROUP) {
            this.svg_groups.push(el);
        }

        for (const mark_type of SVG_TYPE.SVG_MARK) {
            if (el.nodeName == mark_type) {
                this.svg_marks.push(el);
                break;
            }
        }
        
        for (const child of el.childNodes) {
            this.walk_svg(child);
        }
    }

    enable_interactions() {
        for (const [type, identifier] of Object.entries(INTERACTION_TYPES)) {
            this.enabled_interactions[identifier] = true;
        }
        this.enabled_interactions[INTERACTION_TYPES.BRUSH] = false;
    }

    toggle_interaction(interaction_type) {
        this.enabled_interactions[interaction_type] = !this.enabled_interactions[interaction_type];
        this.remove_interactions();
    }

    remove_interactions() {
        let svg = d3.select("#" + this.svg_container.id);
        let g = svg.selectAll(SVG_TYPE.SVG_MARK.join());
        svg.call(d3.zoom().on("zoom", null));
        svg.call(d3.brush(), null);
    }
    
    add_event_listener(el, interaction_type, event) {
        if (!this.enabled_interactions[interaction_type]) {
            return;
        }

        let svg = d3.select("#" + el.id);
        let g = svg.selectAll(SVG_TYPE.SVG_MARK.join());
        let width = el.getAttribute("width");
        let height = el.getAttribute("height");
        let extent = [[0, 0], [width, height]];
        let tooltip = document.getElementById("tooltip");

        switch (interaction_type) {
            case INTERACTION_TYPES.SELECTION:
                switch (event) {
                    case INPUT_EVENTS.HOVER_OVER:
                        for (const mark of this.svg_marks) {
                            mark.addEventListener(event, (event) => {
                                let data = "";
                                let iterable = "datum" in mark.__data__ ? 
                                    mark.__data__.datum : 
                                    ("data" in mark.__data__ ? mark.__data__.data : mark.__data__);

                                for (const [key, value] of Object.entries(iterable)) {
                                    data += String(key) + ": " + String(value);
                                    data += "<br/>";
                                }
        
                                tooltip.innerHTML = data;
                                tooltip.style['visibility'] = 'visible';
                                tooltip.style['left'] = event.clientX;
                                tooltip.style['top'] = event.clientY;
                            });
                        }
                        break;
                    case INPUT_EVENTS.HOVER_LEAVE:
                    default:
                        for (const mark of this.svg_marks) {
                            mark.addEventListener(event, function() {
                                tooltip.style['visibility'] = 'hidden';
                            });
                        }
                        break;
                }
                break;
            case INTERACTION_TYPES.ZOOM:
                if (this.enabled_interactions[INTERACTION_TYPES.ZOOM] && this.enabled_interactions[INTERACTION_TYPES.PAN]) {
                    svg.call(d3.zoom().extent(extent).translateExtent(extent).on("zoom", function({transform}) {
                        g.attr("transform", transform);
                    }));
                }
                else {
                    svg.call(d3.zoom().extent(extent).translateExtent(extent).on("zoom", function({transform}) {
                        g.attr("transform", transform);
                    }))
                    .on("mousedown.zoom", null)
                    .on("touchstart.zoom", null)
                    .on("touchmove.zoom", null)
                    .on("touchend.zoom", null);
                }
                break;
            case INTERACTION_TYPES.PAN:
                if (this.enabled_interactions[INTERACTION_TYPES.ZOOM] && this.enabled_interactions[INTERACTION_TYPES.PAN]) {
                    svg.call(d3.zoom().extent(extent).translateExtent(extent).on("zoom", function({transform}) {
                        g.attr("transform", transform);
                    }));
                }
                else {
                    svg.call(d3.zoom().extent(extent).translateExtent(extent).on("zoom", function({transform}) {
                        g.attr("transform", transform);
                    }))
                    .on("wheel.zoom", null)
                    .on("dblclick.zoom", null);
                }
                break;
            case INTERACTION_TYPES.BRUSH:
                svg.call(d3.brush().extent(extent));
                break;
            default:
                break;
        }
    }

    print_svg_information() {
        console.log(this.svg_container);
        console.log(this.svg_groups);
        console.log(this.svg_marks);
    }

    bind_interaction(interaction_type=INTERACTION_TYPES.ZOOM) {
        for (const event of INTERACTION_MECHANISMS[interaction_type]) {
            this.add_event_listener(this.svg_container, interaction_type, event);
        }
    }

    bind_interactions() {
        for (const [type, identifier] of Object.entries(INTERACTION_TYPES)) {
            this.bind_interaction(identifier);
        }
    }
}
