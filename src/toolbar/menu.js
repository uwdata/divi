export async function createMenu(svg) {
    const divParent = document.createElement('div');
    svg.parentElement.insertBefore(divParent, svg);

    const response = await fetch('src/toolbar/control.html');
    divParent.innerHTML = await response.text();
    divParent.appendChild(svg);
}
