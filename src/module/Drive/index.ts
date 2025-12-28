import { makeFormData } from 'koajax';
import { BaseModel, RESTClient, toggle } from 'mobx-restful';
import { buildURLData } from 'web-utility';

import { LarkData, LarkDocumentType, UploadTargetType } from '../../type';
import { UserIdType } from '../User/type';

export type CopiedFile = Record<'token' | 'type' | 'name' | 'parent_token' | 'url', string>;

export abstract class DriveModel extends BaseModel {
    baseURI = 'drive/v1';
    abstract client: RESTClient;

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/download}
     */
    @toggle('downloading')
    async downloadFile(id: string) {
        const { headers, body } = await this.client.get<Blob>(
            `${this.baseURI}/medias/${id}/download`,
            {},
            { responseType: 'blob' }
        );
        const { 'Content-Disposition': CD, 'Content-Type': CT } = headers;

        const [type] = (CT as string)?.split(';') || [],
            [, fileName] = (CD as string)?.match(/filename="?(.*?)"?$/) || [];

        return new File([body!], fileName, { type });
    }

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_all}
     */
    @toggle('uploading')
    async uploadFile(file: File, parent_type: UploadTargetType, parent_node: string) {
        const form = makeFormData({
            file,
            file_name: file.name,
            size: file.size,
            parent_type,
            parent_node
        });
        const { body } = await this.client.post<LarkData<{ file_token: string }>>(
            `${this.baseURI}/medias/upload_all`,
            form
        );
        return body!.data!.file_token;
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/docs/drive-v1/folder/get-root-folder-meta}
     */
    @toggle('downloading')
    async getRootFolder() {
        const { body } = await this.client.get<
            LarkData<Record<'token' | 'id' | 'user_id', string>>
        >('drive/explorer/v2/root_folder/meta');

        return body!.data!;
    }

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/copy}
     */
    @toggle('uploading')
    async copyFile(
        type: LarkDocumentType,
        file_token: string,
        name: string,
        folder_token?: string,
        user_id_type?: UserIdType
    ) {
        folder_token ||= (await this.getRootFolder()).token;

        const { body } = await this.client.post<LarkData<{ file: CopiedFile }>>(
            `${this.baseURI}/files/${file_token}/copy?${buildURLData({ user_id_type })}`,
            { name, type, folder_token }
        );
        return body!.data!.file;
    }
}
