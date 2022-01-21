const INTERACTION_TYPES = {
    SELECTION: 'Selection',
    ZOOM: 'Zoom',
    PAN: 'Pan',
    FILTER: 'Filter',
    SORT: 'Sort',
    BRUSH: 'Brush',
    HIGHLIGHT: 'Highlight'
};

const INTERACTION_TARGETS = {
    CATEGORICAL: 'Categorical',
    CONTINUOUS: 'Continuous',
    EDGE: 'Edge',
    BACKGROUND: 'Background',
    LEGEND: 'Legend',
    TEXT: 'Text',
    BRUSH_BOX: 'Brush box',
    BRUSH_BOX_EDGE: 'Brush box edge',
    AXIS: 'axis'
}

const INPUT_EVENTS = {
    SCROLL: 'scroll',
    LEFT_CLICK: 'left_click',
    RIGHT_CLICK: 'right_click',
    DBL_CLICK: 'dblclick',
    MOUSE_DOWN: 'mousedown',
    MOUSE_UP: 'mouseup',
    SHIFT: 'shift',
    HOVER_OVER: 'mouseover',
    HOVER_LEAVE: 'mouseleave'
}

const INTERACTION_MECHANISMS = {
    [INTERACTION_TYPES.SELECTION]: [
        // INPUT_EVENTS.MOUSE_DOWN
        INPUT_EVENTS.HOVER_OVER,
        INPUT_EVENTS.HOVER_LEAVE
    ],
    [INTERACTION_TYPES.ZOOM]: [
        // INPUT_EVENTS.SCROLL,
        // [INPUT_EVENTS.LEFT_CLICK, INPUT_EVENTS.SCROLL],
        // [INPUT_EVENTS.SHIFT, INPUT_EVENTS.SCROLL],
        INPUT_EVENTS.DBL_CLICK,
        // [INPUT_EVENTS.LEFT_CLICK, INPUT_EVENTS.DRAG]
    ],
    [INTERACTION_TYPES.PAN]: [
        INPUT_EVENTS.MOUSE_DOWN
    ],
    [INTERACTION_TYPES.FILTER]: [
        INPUT_EVENTS.MOUSE_DOWN
    ],
    [INTERACTION_TYPES.SORT]: [
        INPUT_EVENTS.MOUSE_DOWN
    ],
    [INTERACTION_TYPES.BRUSH]: [
        INPUT_EVENTS.MOUSE_DOWN
    ],
    [INTERACTION_TYPES.HIGHLIGHT]: [
        INPUT_EVENTS.MOUSE_DOWN
    ]
};

const SVG_TYPE = {
    SVG_CONTAINER: "svg",
    SVG_GROUP: "g",
    SVG_MARK: ["circle", "ellipse", "polygon"]
    // SVG_MARK: ["circle", "ellipse", "line", "polygon", "polyline", "rect", "path"]
}
