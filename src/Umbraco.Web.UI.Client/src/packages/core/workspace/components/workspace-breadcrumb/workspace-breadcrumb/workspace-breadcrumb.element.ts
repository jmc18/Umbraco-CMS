import { html, customElement, state, ifDefined } from '@umbraco-cms/backoffice/external/lit';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UMB_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/workspace';
import { UMB_SECTION_CONTEXT } from '@umbraco-cms/backoffice/section';
import type { UmbMenuStructureWorkspaceContext, UmbStructureItemModel } from '@umbraco-cms/backoffice/menu';

@customElement('umb-workspace-breadcrumb')
export class UmbWorkspaceBreadcrumbElement extends UmbLitElement {
	@state()
	_name: string = '';

	@state()
	_structure: UmbStructureItemModel[] = [];

	// TODO: figure out the correct context type
	#workspaceContext?: any;
	#sectionContext?: typeof UMB_SECTION_CONTEXT.TYPE;
	#structureContext?: UmbMenuStructureWorkspaceContext;

	constructor() {
		super();

		this.consumeContext(UMB_SECTION_CONTEXT, (instance) => {
			this.#sectionContext = instance;
		});

		this.consumeContext(UMB_WORKSPACE_CONTEXT, (instance) => {
			this.#workspaceContext = instance as any;
			this.#observeStructure();
			this.#observeName();
		});

		// TODO: set up context token
		this.consumeContext('UmbMenuStructureWorkspaceContext', (instance) => {
			// TODO: get the correct interface from the context token
			this.#structureContext = instance as UmbMenuStructureWorkspaceContext;
			this.#observeStructure();
		});
	}

	#observeStructure() {
		if (!this.#structureContext || !this.#workspaceContext) return;
		const isNew = this.#workspaceContext.getIsNew();

		this.observe(
			this.#structureContext.structure,
			(value) => {
				// TODO: get the type from the context
				const structure = value as Array<UmbStructureItemModel>;
				this._structure = isNew ? structure : structure.slice(0, -1);
			},
			'menuStructureObserver',
		);
	}

	#observeName() {
		this.observe(
			this.#workspaceContext?.name,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			(value) => (this._name = value || ''),
			'breadcrumbWorkspaceNameObserver',
		);
	}

	#getHref(structureItem: UmbStructureItemModel) {
		const workspaceBasePath = `section/${this.#sectionContext?.getPathname()}/workspace/${structureItem.entityType}/edit`;
		return structureItem.isFolder ? undefined : `${workspaceBasePath}/${structureItem.unique}`;
	}

	render() {
		return html`
			<uui-breadcrumbs>
				${this._structure?.map(
					(structureItem) =>
						html`<uui-breadcrumb-item href="${ifDefined(this.#getHref(structureItem))}"
							>${structureItem.name}</uui-breadcrumb-item
						>`,
				)}
				<uui-breadcrumb-item>${this._name}</uui-breadcrumb-item>
			</uui-breadcrumbs>
		`;
	}

	static styles = [UmbTextStyles];
}

export default UmbWorkspaceBreadcrumbElement;

declare global {
	interface HTMLElementTagNameMap {
		'umb-workspace-breadcrumb': UmbWorkspaceBreadcrumbElement;
	}
}
