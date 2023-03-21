import { html } from 'lit';
import { UUITextStyles } from '@umbraco-ui/uui-css/lib';
import { customElement, property } from 'lit/decorators.js';
import { UmbLitElement } from '@umbraco-cms/internal/lit-element';

/**
 * @element umb-property-editor-ui-tiny-mce-dimensions-configuration
 */
@customElement('umb-property-editor-ui-tiny-mce-dimensions-configuration')
export class UmbPropertyEditorUITinyMceDimensionsConfigurationElement extends UmbLitElement {
	static styles = [UUITextStyles];

	@property()
	value: { width?: number; height?: number } = {};

	render() {
		return html`<uui-input type="number" placeholder="Width" .value=${this.value.width}></uui-input> x
			<uui-input type="number" placeholder="Height" .value=${this.value.height}></uui-input> pixels`;
	}
}

export default UmbPropertyEditorUITinyMceDimensionsConfigurationElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-property-editor-ui-tiny-mce-dimensions-configuration': UmbPropertyEditorUITinyMceDimensionsConfigurationElement;
	}
}
