import { RESTClient, toggle } from 'mobx-restful';
import { buildURLData } from 'web-utility';

import { LarkData } from '../../type';
import {
    PasswordResponse,
    PermissionFileType,
    PermissionPublic,
    PermissionPublicResponse
} from './type';

export * from './type';

export abstract class PermissionModel {
    abstract client: RESTClient;

    /**
     * Update common settings of a document
     *
     * @see {@link https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2}
     */
    @toggle('uploading')
    async updatePermissions(
        token: string,
        type: PermissionFileType,
        data: PermissionPublic
    ) {
        const { body } = await this.client.patch<LarkData<PermissionPublicResponse>>(
            `drive/v2/permissions/${token}/public?${buildURLData({ type })}`,
            data
        );
        return body!.data!.permission_public;
    }

    /**
     * Enable password for a document
     *
     * @see {@link https://open.feishu.cn/document/server-docs/docs/permission/permission-public/permission-public-password/create}
     */
    @toggle('uploading')
    async setPassword(token: string, type: PermissionFileType) {
        const { body } = await this.client.post<LarkData<PasswordResponse>>(
            `drive/v1/permissions/${token}/public/password?${buildURLData({ type })}`
        );
        return body!.data!.password;
    }
}
