import type { ManifestPropertyEditorUi } from '@umbraco-cms/backoffice/extension-registry';

export const manifest: ManifestPropertyEditorUi = {
	type: 'propertyEditorUi',
	alias: 'Umb.PropertyEditorUi.OrderDirection',
	name: 'Order Direction Property Editor UI',
	js: () => import('./property-editor-ui-order-direction.element.js'),
	meta: {
		label: 'Order Direction',
		propertyEditorSchemaAlias: '',
		icon: 'icon-autofill',
		group: 'common',
	},
};
