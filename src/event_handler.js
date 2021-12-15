class EventHandler {
    constructor(interaction_type) {
        this.interaction_type = interaction_type;
        this.svg_container = null;
        this.svg_groups = [];
        this.svg_marks = [];
        this.walk_svg(document.body);
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
    
    add_event_listener(el, interaction_type, event) {
        let svg = d3.select("#" + el.id);
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
                                for (const [key, value] of Object.entries(mark.__data__)) {
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
            case INTERACTION_TYPES.ZOOM:
                let g = svg.selectAll(SVG_TYPE.SVG_MARK.join());
                svg.call(d3.zoom().extent(extent).translateExtent(extent).on("zoom", function({transform}) {
                    g.attr("transform", transform);
                }));
            case INTERACTION_TYPES.PAN:
                break;
            case INTERACTION_TYPES.BRUSH:
                // svg.call(d3.brush().extent(extent));
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
