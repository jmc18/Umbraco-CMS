import { UmbSaveWorkspaceAction } from '@umbraco-cms/backoffice/workspace';
import type {
	ManifestWorkspace,
	ManifestWorkspaceAction,
	ManifestWorkspaceEditorView,
} from '@umbraco-cms/backoffice/extension-registry';

const workspace: ManifestWorkspace = {
	type: 'workspace',
	alias: 'Umb.Workspace.Template',
	name: 'Template Workspace',
	js: () => import('./template-workspace.element.js'),
	meta: {
		entityType: 'template',
	},
};

const workspaceViews: Array<ManifestWorkspaceEditorView> = [];

const workspaceActions: Array<ManifestWorkspaceAction> = [
	{
		type: 'workspaceAction',
		alias: 'Umb.WorkspaceAction.Template.Save',
		name: 'Save Template',
		api: UmbSaveWorkspaceAction,
		weight: 70,
		meta: {
			look: 'primary',
			color: 'positive',
			label: 'Save',
		},
		conditions: [
			{
				alias: 'Umb.Condition.WorkspaceAlias',
				match: workspace.alias,
			},
		],
	},
];

export const manifests = [workspace, ...workspaceViews, ...workspaceActions];
