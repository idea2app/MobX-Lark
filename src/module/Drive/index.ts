import { makeFormData } from 'koajax';
import { BaseListModel, RESTClient, toggle } from 'mobx-restful';
import { buildURLData } from 'web-utility';

import { LarkData, LarkDocumentType, UploadTargetType } from '../../type';
import { UserIdType } from '../User/type';
import { CopiedFile, DriveFile } from './type';

export * from './type';

export abstract class DriveFileModel extends BaseListModel<DriveFile> {
    baseURI = 'drive/v1';
    abstract client: RESTClient;

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/docs/drive-v1/file/batch_query}
     *
     * @param URI such as `docx/xxxyyyzzz`
     */
    @toggle('downloading')
    async getOne(URI: string, user_id_type?: UserIdType) {
        let [doc_type, doc_token] = new URL(URI, 'http://localhost').pathname.split('/');

        const { body } = await this.client.post<LarkData<{ metas: DriveFile[] }>>(
            `${this.baseURI}/metas/batch_query?${buildURLData({ user_id_type })}`,
            { request_docs: [{ doc_type, doc_token }], with_url: true }
        );
        return body!.data!.metas[0];
    }

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/download}
     */
    @toggle('downloading')
    async downloadOne(id: string) {
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
    async uploadOne(file: File, parent_type: UploadTargetType, parent_node: string) {
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
    async copyOne(
        type: LarkDocumentType,
        file_token: string,
        name?: string,
        folder_token?: string,
        user_id_type?: UserIdType
    ) {
        name ||= (await this.getOne(`${type}/${file_token}`, user_id_type)).title + ' (copy)';
        folder_token ||= (await this.getRootFolder()).token;

        const { body } = await this.client.post<LarkData<{ file: CopiedFile }>>(
            `${this.baseURI}/files/${file_token}/copy?${buildURLData({ user_id_type })}`,
            { name, type, folder_token }
        );
        return body!.data!.file;
    }
}
