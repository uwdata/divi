export function inspect(svg) {
    let state = new ViewState();

    state.svgCopy = svg.cloneNode(true);
    state.svgCopy.id = svg.id + '-' + id++;
    svg.style['display'] = 'none';
    svg.parentElement.appendChild(state.svgCopy);

    analyzeDomTree(state.svgCopy, state, new Transform());
    // svg.style['display'] = 'block';
    console.log(state);
    return state;
}


function manipulator(state) { 
}

manipulator.zoom = function(extentX, extentY) {
    console.log('zoom');
   zoom(states[0], extentX, extentY);
}
manipulator.select = function(target, value, extentX, extentY) {
    console.log('select');
    switch(target) {
        case 'marks':
            filter(states[0], extentX[0], extentY[0], extentX[1] - extentX[0], extentY[1] - extentY[0]);
            break;
        case 'legend':
            select.selectLegend(states[0], value);
            break;
    }
}
manipulator.filter = function(include) {
    console.log('filter');
    for (const mark of states[0].svgMarks) {
        if (mark.hasAttribute("__legend__")) continue;     
    
        mark.style['visibility'] = +mark.getAttribute("opacity") === 1 && (!mark.style['visibility'] || mark.style['visibility'] === 'visible') 
            ? include ? 'visible' : 'hidden'
            : include ? 'hidden' : 'visible';
        if (mark.style['visibility'] === 'visible') mark.setAttribute('opacity', 1);
        mark.style['pointer-events'] = +mark.getAttribute("opacity") === 1 ? 'fill' : 'none';
    }
}
manipulator.annotate = function(x, y, text) {
    console.log('annotate');
    annotate(states[0], x, y, text);
}
manipulator.getState = function() {
    return states[0];
}
manipulator.toggle = function(svgId) {
    const svg = document.getElementById(svgId);
    if (states[0].svg.style['display'] === 'none') {
        [...svg.querySelectorAll('svg')].forEach(d => d.style['display'] = 'none');
        states[0].svg.style['display'] = 'block';
    } else {
        states[0].svg.style['display'] = 'none';
        svg.querySelector('svg').style['display'] = 'block';
    }
    // if (states[0].svg.style['display'])
    // if (svgCopy.style['display'] === 'block') {
    //     svgCopy.style['display'] = 'none';
    //     states[0].svg.style['display'] = 'block';
    // } else {
    //     svgCopy.style['display'] = 'block';
    //     states[0].svg.style['display'] = 'none';
    // }
}

return manipulator;
