
export function annotate(SVG) {
    bind(SVG);
}

// annotate.unbind = function() {
//     document.removeEventListener('click', listener);
// }

let bind = function(SVG) {
    function listener (event) {
        if (!SVG.state().interactions.annotate.flag) return;

        let text = prompt('Type here');
        if (!text) return;

        const annotations = [
            {
              note: {
                label: text
                // title: "d3.annotationLabel"
              },
              x: event.clientX - SVG.state().svg.getBoundingClientRect().left,
              y: event.clientY - SVG.state().svg.getBoundingClientRect().top,
              dy: 20,
              dx: 20,
              connector: {
                end: "dot" // 'dot' also available
              }
            }]

        const makeAnnotations = d3.annotation()
            .type(d3.annotationLabel)
            .annotations(annotations)

        d3.select("#" + SVG.state().svg.id)
            .append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations)
        
        var keys = (event.ctrlKey ? " ctrl " : "") + (event.shiftKey ? " shift " : "") + (event.altKey ? " alt " : "");
        document.getElementById("logfile").innerHTML += event.type + " [" + keys + "] " + SVG.state().svg.id + " to annotate <br/>";
    }  

    document.addEventListener('mouseup', listener);
}
