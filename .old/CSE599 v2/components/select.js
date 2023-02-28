import {LitElement, html, css} from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

function waitForElm(elm, selector) {
    return new Promise(resolve => {
        if (elm.querySelector(selector)) {
            return resolve(elm.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (elm.querySelector(selector)) {
                resolve(elm.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(elm, {
            childList: true,
            subtree: true
        });
    });
}

export class Select extends LitElement {
    constructor() {
        super();
        this.svgId = null;
        this.textId = null;
        this.target = null;
        this.value = null;
        this.extentX = null;
        this.extentY = null;
        this.manipulator = null;
        this.addEventListener('emit-svg', this.handleSvg);
    }

    static properties = {
        svgId: {type: String},
        textId: {type: String},
        target: {type: String},
        value: {type: Array},
        extentX: {type: Array},
        extentY: {type: Array}
    }

    get _slottedChild() {
        const slot = this.shadowRoot.querySelector('slot');
        return slot.assignedElements({flatten: true})[0];
    }
  
    emitSvg(state) {
        const options = {
            detail: {state: state},
            bubbles: true,
            composed: true
        };

        this.dispatchEvent(new CustomEvent('emit-svg', options));
    }

    handleSvg(e) {
        const source = e.target;
        if (source === this._slottedChild) {
            this.hydrate(e.detail.state);
        }
    }

    hydrate(svg, copy) {
        this.manipulator = AutomaticInteraction.hydrate(svg);
        this.manipulator.select(this.target, this.value, this.extentX, this.extentY);
        this.emitSvg(this.manipulator.getState(), copy);
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.svgId) {
            waitForElm(document.getElementById(this.svgId), 'svg').then((elm) => {
                setTimeout(() => this.hydrate(elm), 50);
            });
        }
        if (this.textId) {
            const text = document.getElementById(this.textId);
            text.style['color'] = 'blue';
            text.style['cursor'] = 'pointer';
            waitForElm(document.getElementById(this.svgId), 'svg').then((elm) => {
                setTimeout(() => this.manipulator.toggle(this.svgId), 50);
            });
            text.addEventListener('click', () => this.manipulator.toggle(this.svgId));
        }
    }

    render() {
        return html`<div>\<slot style="display:none;"></slot></div>`;
    }
}
customElements.define('select-clause', Select);
