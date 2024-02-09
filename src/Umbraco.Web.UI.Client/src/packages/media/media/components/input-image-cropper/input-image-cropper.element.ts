import { LitElement, css, html, customElement, property, query, state } from '@umbraco-cms/backoffice/external/lit';
import './image-cropper.element.js';
import './image-cropper-focus-setter.element.js';
import './image-cropper-preview.element.js';
import './image-cropper-field.element.js';
import type { UUIFileDropzoneElement, UUIFileDropzoneEvent } from '@umbraco-cms/backoffice/external/uui';
import { UmbLitElement } from '@umbraco-cms/internal/lit-element';
import type { TemporaryFileQueueItem } from '../../../../core/temporary-file/temporary-file-manager.class.js';
import { UmbTemporaryFileManager } from '../../../../core/temporary-file/temporary-file-manager.class.js';
import { UmbImageCropperCrops, UmbImageCropperFocalPoint, UmbImageCropperPropertyEditorValue } from './index.js';
import { UmbId } from '@umbraco-cms/backoffice/id';

@customElement('umb-input-image-cropper')
export class UmbInputImageCropperElement extends UmbLitElement {
	@query('#dropzone')
	private _dropzone?: UUIFileDropzoneElement;

	@property({ attribute: false })
	value: UmbImageCropperPropertyEditorValue = {
		src: '',
		crops: [],
		focalPoint: { left: 0.5, top: 0.5 },
	};

	@state()
	file?: File;

	@state()
	fileUnique?: string;

	#manager?: UmbTemporaryFileManager;

	constructor() {
		super();
		this.#manager = new UmbTemporaryFileManager(this);

		// this.observe(this.#manager.isReady, (value) => (this.error = !value));
		this.observe(this.#manager.queue, this.#onQueueUpdate);
	}

	updated(changedProperties: Map<string | number | symbol, unknown>) {
		super.updated(changedProperties);

		console.log('changedProperties', this.value);
	}

	#onQueueUpdate = (value: TemporaryFileQueueItem[]) => {
		if (value.length) {
			this.file = value[0].file;
			this.fileUnique = value[0].unique;
			this.value.src = value[0].unique;
		}
	};

	#onUpload(e: UUIFileDropzoneEvent) {
		const file = e.detail.files[0];

		if (!file) return;

		this.#manager?.uploadOne(UmbId.new(), file, 'waiting');
	}

	#onBrowse() {
		if (!this._dropzone) return;
		this._dropzone.browse();
	}

	render() {
		console.log('render', this.value);
		if (this.value.src || this.file) {
			return this.#renderImageCropper();
		}

		return this.#renderDropzone();
	}

	#renderDropzone() {
		return html`
			<uui-file-dropzone id="dropzone" label="dropzone" @change="${this.#onUpload}">
				<uui-button label="upload" @click="${this.#onBrowse}">Upload file here</uui-button>
			</uui-file-dropzone>
		`;
	}

	#renderImageCropper() {
		return html`<umb-image-cropper-field .value=${this.value} .file=${this.file}></umb-image-cropper-field>`;
	}

	static styles = css``;
}

declare global {
	interface HTMLElementTagNameMap {
		'umb-input-image-cropper': UmbInputImageCropperElement;
	}
}
