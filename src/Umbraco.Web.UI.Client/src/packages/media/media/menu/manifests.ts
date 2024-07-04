import { UMB_MEDIA_TREE_ALIAS } from '../tree/index.js';
import { UMB_MEDIA_MENU_ALIAS } from './constants.js';
import type { ManifestTypes } from '@umbraco-cms/backoffice/extension-registry';

export const manifests: Array<ManifestTypes> = [
	{
		type: 'menu',
		alias: UMB_MEDIA_MENU_ALIAS,
		name: 'Media Menu',
	},
	{
		type: 'menuItem',
		kind: 'tree',
		alias: 'Umb.MenuItem.Media',
		name: 'Media Menu Item',
		weight: 100,
		meta: {
			label: 'Media',
			menus: [UMB_MEDIA_MENU_ALIAS],
			treeAlias: UMB_MEDIA_TREE_ALIAS,
			hideTreeRoot: true,
		},
	},
	{
		type: 'workspaceContext',
		name: 'Media Menu Structure Workspace Context',
		alias: 'Umb.Context.Media.Menu.Structure',
		api: () => import('./media-menu-structure.context.js'),
		conditions: [
			{
				alias: 'Umb.Condition.WorkspaceAlias',
				match: 'Umb.Workspace.Media',
			},
		],
	},
	{
		type: 'workspaceFooterApp',
		kind: 'variantMenuBreadcrumb',
		alias: 'Umb.WorkspaceFooterApp.Media.Breadcrumb',
		name: 'Media Breadcrumb Workspace Footer App',
		conditions: [
			{
				alias: 'Umb.Condition.WorkspaceAlias',
				match: 'Umb.Workspace.Media',
			},
		],
	},
];
