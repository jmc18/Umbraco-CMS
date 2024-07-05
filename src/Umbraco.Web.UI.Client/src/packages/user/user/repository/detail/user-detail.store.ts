import type { UmbUserDetailModel } from '../../types.js';
import { UMB_USER_DETAIL_STORE_CONTEXT } from './user-detail.store.token.js';
import { UmbDetailStoreBase } from '@umbraco-cms/backoffice/store';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';

/**
 * @export
 * @class UmbUserDetailStore
 * @extends {UmbStoreBase}
 * @description - Data Store for User Details
 */
export class UmbUserDetailStore extends UmbDetailStoreBase<UmbUserDetailModel> {
	/**
	 * Creates an instance of UmbUserDetailStore.
	 * @param {UmbControllerHost} host
	 * @memberof UmbUserDetailStore
	 */
	constructor(host: UmbControllerHost) {
		super(host, UMB_USER_DETAIL_STORE_CONTEXT.toString());
	}
}

export default UmbUserDetailStore;
