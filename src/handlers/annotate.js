
export function annotate(state) {
    bind(state);
}

// annotate.unbind = function() {
//     document.removeEventListener('click', listener);
// }

let bind = function(state) {
    function listener (event) {
        if (!state.interactions.annotate.flag || state.svg.parentElement.style['visibility'] === "hidden") return;

        let x_click = event.clientX - state.svg.getBoundingClientRect().left,
            y_click = event.clientY - state.svg.getBoundingClientRect().top;
        
        if (x_click < state.xAxis.range[0] || y_click < state.yAxis.range[1]) return;

        let text = prompt('Annotation text:');
        if (!text) return;

        const annotations = [
            {
              note: {
                label: text
                // title: "d3.annotationLabel"
              },
              x: event.clientX - state.svg.getBoundingClientRect().left,
              y: event.clientY - state.svg.getBoundingClientRect().top,
              dy: 20,
              dx: 20,
              connector: {
                end: "dot" // 'dot' also available
              }
            }]

        const makeAnnotations = d3.annotation()
            .type(d3.annotationLabel)
            .annotations(annotations)

        d3.select("#" + state.svg.id)
            .append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations)
        
        // var keys = (event.ctrlKey ? " ctrl " : "") + (event.shiftKey ? " shift " : "") + (event.altKey ? " alt " : "");
        // document.getElementById("logfile").innerHTML += event.type + " [" + keys + "] " + SVG.state().svg.id + " to annotate <br/>";
    }  

    document.addEventListener('mouseup', listener);
}
