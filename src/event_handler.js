class EventHandler {
    constructor(interaction_type) {
        this.interaction_type = interaction_type;
        this.svg_container = null;
        this.svg_elems = [];
        this.walk_svg(document.body);
    }

    walk_svg(el) {
        if (el == null) {
            return;
        }

        if (el.nodeName == SVG_TYPE.SVG_CONTAINER) {
            this.svg_container = el;
        }

        if (el.nodeName == SVG_TYPE.SVG_ELEMENT) {
            this.svg_elems.push(el);
        }
        
        for (const child of el.childNodes) {
            this.walk_svg(child);
        }
    }
    
    add_event_listener(el, event) {
        let svg = d3.select("#" + el.id);
        let g = svg.selectAll("circle");

        let extent = [[0, 0], [el.getAttribute("width"), el.getAttribute("height")]];
        // svg.call(d3.zoom().extent(extent).translateExtent(extent).scaleExtent([1, 8]).on("zoom", function({transform}) {
        //     g.attr("transform", transform);
        // }));

        svg.call(d3.brush()                    
        .extent([[0,0], [el.getAttribute("width"), el.getAttribute("height")]]));

        // el.addEventListener(event, () => {
        //     let svg = d3.select(el.id);
        //     console.log(svg);
        //     svg.call(d3.zoom().on("zoom", function () {
        //         svg.attr("transform", d3.event.transform)
        //     }));
        // });
    }

    print_svg_information() {
        console.log(this.svg_container);
        console.log(this.svg_elems);
    }

    bind_interaction(interaction_type=INTERACTION_TYPES.ZOOM) {
        for (const event of INTERACTION_MECHANISMS[interaction_type]) {
            this.add_event_listener(this.svg_container, event);
        }
    }

    bind_interactions() {
        for (const interaction_type in INTERACTION_TYPES) {
            this.bind_interaction(interaction_type);
        }
    }
}
