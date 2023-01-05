import { UmbWorkspaceContentContext } from '../../../shared/components/workspace/workspace-content/workspace-content.context';
import type { UmbDataTypeStore, UmbDataTypeStoreItemType } from 'src/backoffice/settings/data-types/data-type.store';
import type { DataTypeDetails } from '@umbraco-cms/models';
import { UmbControllerHostInterface } from 'src/core/controller/controller-host.mixin';

const DefaultDataTypeData = {
	key: '',
	name: '',
	icon: '',
	type: 'dataType',
	hasChildren: false,
	parentKey: '',
	propertyEditorModelAlias: '',
	propertyEditorUIAlias: '',
	data: [],
} as UmbDataTypeStoreItemType;

export class UmbWorkspaceDataTypeContext extends UmbWorkspaceContentContext<UmbDataTypeStoreItemType, UmbDataTypeStore> {
	constructor(host: UmbControllerHostInterface, entityKey: string) {
		super(host, DefaultDataTypeData, 'umbDataTypeStore', entityKey, 'dataType');
	}

	public setPropertyValue(propertyAlias: string, value: any) {
		// TODO: what if this is a tree item?
		const data = this._data.getValue();
		const property = (data as DataTypeDetails).data?.find((p) => p.alias === propertyAlias);
		if (!property) return;

		property.value = value;
		this._data.next({ ...data });
	}
}
