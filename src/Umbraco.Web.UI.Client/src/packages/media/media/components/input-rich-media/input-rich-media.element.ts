import { UMB_IMAGE_CROPPER_EDITOR_MODAL, UMB_MEDIA_PICKER_MODAL } from '../../modals/index.js';
import type { UmbCropModel, UmbMediaPickerPropertyValue } from '../../property-editors/index.js';
import { customElement, html, ifDefined, nothing, property, repeat, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbChangeEvent } from '@umbraco-cms/backoffice/event';
import { UmbId } from '@umbraco-cms/backoffice/id';
import { UmbImagingRepository } from '@umbraco-cms/backoffice/imaging';
import { UmbInputMediaElement, UmbMediaItemRepository } from '@umbraco-cms/backoffice/media';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import {
	UMB_MODAL_MANAGER_CONTEXT,
	UmbModalRouteRegistrationController,
	umbConfirmModal,
} from '@umbraco-cms/backoffice/modal';
import { UmbSorterController } from '@umbraco-cms/backoffice/sorter';
import { UUIFormControlMixin } from '@umbraco-cms/backoffice/external/uui';
import type { UmbMediaItemModel, UmbUploadableFileModel } from '@umbraco-cms/backoffice/media';
import type { UmbModalManagerContext, UmbModalRouteBuilder } from '@umbraco-cms/backoffice/modal';
import type { UmbVariantId } from '@umbraco-cms/backoffice/variant';

type UmbRichMediaCardModel = {
	unique: string;
	media: string;
	name: string;
	src?: string;
	icon?: string;
	isTrashed?: boolean;
};

const elementName = 'umb-input-rich-media';

@customElement(elementName)
export class UmbInputRichMediaElement extends UUIFormControlMixin(UmbLitElement, '') {
	#sorter = new UmbSorterController<UmbMediaPickerPropertyValue>(this, {
		getUniqueOfElement: (element) => {
			return element.id;
		},
		getUniqueOfModel: (modelEntry) => {
			return modelEntry.key;
		},
		identifier: 'Umb.SorterIdentifier.InputRichMedia',
		itemSelector: 'uui-card-media',
		containerSelector: '.container',
		/** TODO: This component probably needs some grid-like logic for resolve placement... [LI] */
		resolvePlacement: () => false,
		onChange: ({ model }) => {
			this.items = model;
			this.dispatchEvent(new UmbChangeEvent());
		},
	});

	/**
	 * This is a minimum amount of selected items in this input.
	 * @type {number}
	 * @attr
	 * @default 0
	 */
	@property({ type: Number })
	public min = 0;

	/**
	 * Min validation message.
	 * @type {boolean}
	 * @attr
	 * @default
	 */
	@property({ type: String, attribute: 'min-message' })
	minMessage = 'This field need more items';

	/**
	 * This is a maximum amount of selected items in this input.
	 * @type {number}
	 * @attr
	 * @default Infinity
	 */
	@property({ type: Number })
	public max = Infinity;

	/**
	 * Max validation message.
	 * @type {boolean}
	 * @attr
	 * @default
	 */
	@property({ type: String, attribute: 'min-message' })
	maxMessage = 'This field exceeds the allowed amount of items';

	@property({ type: Array })
	public set items(value: Array<UmbMediaPickerPropertyValue>) {
		this.#sorter.setModel(value);
		this.#items = value;
		this.#populateCards();
	}
	public get items(): Array<UmbMediaPickerPropertyValue> {
		return this.#items;
	}
	#items: Array<UmbMediaPickerPropertyValue> = [];

	@property({ type: Array })
	allowedContentTypeIds?: string[] | undefined;

	@property({ type: String })
	startNode = '';

	@property({ type: Boolean })
	multiple = false;

	@property()
	public get value() {
		return this.items?.map((item) => item.mediaKey).join(',');
	}

	@property({ type: Array })
	public set preselectedCrops(value: Array<UmbCropModel>) {
		this.#preselectedCrops = value;
	}
	public get preselectedCrops(): Array<UmbCropModel> {
		return this.#preselectedCrops;
	}
	#preselectedCrops: Array<UmbCropModel> = [];

	@property({ type: Boolean })
	public set focalPointEnabled(value: boolean) {
		this.#focalPointEnabled = value;
	}
	public get focalPointEnabled(): boolean {
		return this.#focalPointEnabled;
	}
	#focalPointEnabled: boolean = false;

	@property()
	public set alias(value: string | undefined) {
		this.#modalRouter.setUniquePathValue('propertyAlias', value);
	}
	public get alias(): string | undefined {
		return this.#modalRouter.getUniquePathValue('propertyAlias');
	}

	@property()
	public set variantId(value: string | UmbVariantId | undefined) {
		this.#modalRouter.setUniquePathValue('variantId', value?.toString());
	}
	public get variantId(): string | undefined {
		return this.#modalRouter.getUniquePathValue('variantId');
	}

	@state()
	private _cards: Array<UmbRichMediaCardModel> = [];

	@state()
	private _routeBuilder?: UmbModalRouteBuilder;

	#itemRepository = new UmbMediaItemRepository(this);

	#imagingRepository = new UmbImagingRepository(this);

	#modalRouter: UmbModalRouteRegistrationController;
	#modalManager?: UmbModalManagerContext;

	constructor() {
		super();

		this.consumeContext(UMB_MODAL_MANAGER_CONTEXT, (instance) => {
			this.#modalManager = instance;
		});

		this.#modalRouter = new UmbModalRouteRegistrationController(this, UMB_IMAGE_CROPPER_EDITOR_MODAL)
			.addAdditionalPath(':key')
			.addUniquePaths(['propertyAlias', 'variantId'])
			.onSetup((params) => {
				const key = params.key;
				if (!key) return false;

				const item = this.items.find((item) => item.key === key);
				if (!item) return false;

				return {
					data: {
						cropOptions: this.preselectedCrops,
						focalPointEnabled: this.focalPointEnabled,
						key,
						unique: item.mediaKey,
					},
					value: {
						crops: item.crops ?? [],
						focalPoint: item.focalPoint ?? { left: 0.5, top: 0.5 },
						src: '',
						key,
						unique: item.mediaKey,
					},
				};
			})
			.onSubmit((value) => {
				this.items = this.items.map((item) => {
					const focalPoint = this.focalPointEnabled ? value.focalPoint : null;
					return item.key === value.key ? { ...item, ...value, focalPoint } : item;
				});

				this.dispatchEvent(new UmbChangeEvent());
			})
			.observeRouteBuilder((routeBuilder) => {
				this._routeBuilder = routeBuilder;
			});

		this.addValidator(
			'rangeUnderflow',
			() => this.minMessage,
			() => !!this.min && this.items?.length < this.min,
		);
		this.addValidator(
			'rangeOverflow',
			() => this.maxMessage,
			() => !!this.max && this.items?.length > this.max,
		);
	}

	async #populateCards() {
		// TODO This is being called twice when picking an media item. We don't want to call the server unnecessary...
		if (!this.items?.length) {
			this._cards = [];
			return;
		}

		const uniques = this.items.map((item) => item.mediaKey);

		const { data: items } = await this.#itemRepository.requestItems(uniques);
		const { data: thumbnails } = await this.#imagingRepository.requestThumbnailUrls(uniques, 400, 400);

		this._cards = this.items.map((item) => {
			const media = items?.find((x) => x.unique === item.mediaKey);
			const thumbnail = thumbnails?.find((x) => x.unique === item.mediaKey);
			return {
				unique: item.key,
				media: item.mediaKey,
				name: media?.name ?? '',
				src: thumbnail?.url,
				icon: media?.mediaType?.icon,
				isTrashed: media?.isTrashed ?? false,
			};
		});
	}

	protected getFormElement() {
		return undefined;
	}

	#pickableFilter: (item: UmbMediaItemModel) => boolean = (item) => {
		if (this.allowedContentTypeIds && this.allowedContentTypeIds.length > 0) {
			return this.allowedContentTypeIds.includes(item.mediaType.unique);
		}
		return true;
	};

	#addItems(uniques: string[]) {
		if (!uniques.length) return;

		const additions: Array<UmbMediaPickerPropertyValue> = uniques.map((unique) => ({
			key: UmbId.new(),
			mediaKey: unique,
			mediaTypeAlias: '',
			crops: [],
			focalPoint: null,
		}));

		this.items = [...this.#items, ...additions];
		this.#populateCards();
		this.dispatchEvent(new UmbChangeEvent());
	}

	async #openPicker() {
		const modalHandler = this.#modalManager?.open(this, UMB_MEDIA_PICKER_MODAL, {
			data: {
				multiple: this.multiple,
				startNode: this.startNode,
				pickableFilter: this.#pickableFilter,
			},
			value: { selection: [] },
		});

		const data = await modalHandler?.onSubmit().catch(() => null);
		if (!data) return;

		const selection = data.selection;
		this.#addItems(selection);
	}

	async #onRemove(item: UmbRichMediaCardModel) {
		await umbConfirmModal(this, {
			color: 'danger',
			headline: `${this.localize.term('actions_remove')} ${item.name}?`,
			content: `${this.localize.term('defaultdialogs_confirmremove')} ${item.name}?`,
			confirmLabel: this.localize.term('actions_remove'),
		});

		const index = this.items.findIndex((x) => x.key === item.unique);
		if (index == -1) return;

		const tmpItems = [...this.items];
		tmpItems.splice(index, 1);
		this.items = tmpItems;

		this.dispatchEvent(new UmbChangeEvent());
	}

	async #onUploadCompleted(e: CustomEvent) {
		const completed = e.detail?.completed as Array<UmbUploadableFileModel>;
		const uploaded = completed.map((file) => file.unique);
		this.#addItems(uploaded);
	}

	render() {
		return html`
			${this.#renderDropzone()}
			<div class="container">${this.#renderItems()} ${this.#renderAddButton()}</div>
		`;
	}

	#renderDropzone() {
		if (this._cards && this._cards.length >= this.max) return;
		return html`<umb-dropzone @change=${this.#onUploadCompleted}></umb-dropzone>`;
	}

	#renderItems() {
		if (!this._cards.length) return;
		return html`
			${repeat(
				this._cards,
				(item) => item.unique,
				(item) => this.#renderItem(item),
			)}
		`;
	}

	#renderAddButton() {
		if ((this._cards && this.max && this._cards.length >= this.max) || (this._cards.length && !this.multiple)) return;
		return html`
			<uui-button
				id="btn-add"
				look="placeholder"
				@click=${this.#openPicker}
				label=${this.localize.term('general_choose')}>
				<uui-icon name="icon-add"></uui-icon>
				${this.localize.term('general_choose')}
			</uui-button>
		`;
	}

	#renderItem(item: UmbRichMediaCardModel) {
		if (!item.unique) return nothing;
		const href = this._routeBuilder?.({ key: item.unique });
		return html`
			<uui-card-media id=${item.unique} name=${item.name} .href=${href}>
				${item.src
					? html`<img src=${item.src} alt=${item.name} />`
					: html`<umb-icon name=${ifDefined(item.icon)}></umb-icon>`}
				${this.#renderIsTrashed(item)}
				<uui-action-bar slot="actions">
					<uui-button
						label=${this.localize.term('general_remove')}
						look="secondary"
						@click=${() => this.#onRemove(item)}>
						<uui-icon name="icon-trash"></uui-icon>
					</uui-button>
				</uui-action-bar>
			</uui-card-media>
		`;
	}

	#renderIsTrashed(item: UmbRichMediaCardModel) {
		if (!item.isTrashed) return;
		return html`
			<uui-tag size="s" slot="tag" color="danger">
				<umb-localize key="mediaPicker_trashed">Trashed</umb-localize>
			</uui-tag>
		`;
	}

	static styles = UmbInputMediaElement.styles;
}

export default UmbInputRichMediaElement;

declare global {
	interface HTMLElementTagNameMap {
		[elementName]: UmbInputRichMediaElement;
	}
}
