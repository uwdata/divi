import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class Brush extends LitElement {
    constructor() {
        super();
        this.id = null;
    }

    static properties = {
        id: {type: String}
    }

    get _slottedChild() {
        const slot = this.shadowRoot.querySelector('slot');
        return slot.assignedElements({flatten: true})[0];
    }

    emitSvg(_svg) {
        const options = {
            detail: {svg: _svg},
            bubbles: true,
            composed: true
        };

        this.dispatchEvent(new CustomEvent('emit-svg', options));
    }

    handleSvg(e) {
        const source = e.target;
        if (source === this._slottedChild) {
            this.emitSvg(e.detail.svg);
        } 
    }

    render() {
        if (this.svgId) {
            const svg = document.getElementById(this.svgId).querySelector('svg');
            AutomaticInteraction.hydrate(svg);
            this.emitSvg(svg);
        }
        return html`<div @emit-svg="${this.handleSvg}"><slot style="display:none;"></slot></div>`;
    }
}
customElements.define('brush-clause', Brush);
