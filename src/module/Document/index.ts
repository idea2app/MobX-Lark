import { BaseListModel, IDType, NewData, toggle } from 'mobx-restful';
import { buildURLData } from 'web-utility';

import { LarkData } from '../../type';
import { UserIdType } from '../User/type';
import { DocumentBlockModel } from './model/Block';
import { Document } from './type';

export * from './type';
export * from './model/Block';
export * from './component';

export type FileURLResolver = (token: string) => string | Promise<string>;

export abstract class DocumentModel extends BaseListModel<Document> {
    baseURI = 'docx/v1/documents';

    constructor(public domain: string) {
        super();
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document/get}
     */
    @toggle('downloading')
    async getOne(id: IDType) {
        const { body } = await this.client.get<LarkData<{ document: Document }>>(
            `${this.baseURI}/${id}`
        );
        return (this.currentOne = body!.data!.document);
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document/create}
     */
    @toggle('uploading')
    async updateOne(data: Partial<NewData<Document>>, id?: IDType) {
        const { body } = await this.client.post<LarkData<{ document: Document }>>(
            this.baseURI,
            data
        );
        return (this.currentOne = body!.data!.document);
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document/raw_content}
     * @see {@link https://open.feishu.cn/document/docs/docs-v1/get}
     */
    @toggle('downloading')
    async getOneContent(
        doc_token: string,
        content_type: 'text' | 'markdown' = 'markdown',
        lang: 'zh' | 'en' | 'ja' = 'zh'
    ) {
        const { body } = await (content_type === 'text'
            ? this.client.get<LarkData<{ content: string }>>(
                  `${this.baseURI}/${doc_token}/raw_content?${buildURLData({ lang: ['zh', 'en', 'ja'].indexOf(lang) })}`
              )
            : this.client.get<LarkData<{ content: string }>>(
                  `docs/v1/content?${buildURLData({ doc_type: 'docx', doc_token, content_type, lang })}`
              ));
        return body!.data!.content;
    }

    @toggle('downloading')
    async getOneBlocks(id: string, resolveFileURL?: FileURLResolver) {
        const { client, domain } = this;

        class MyDocumentBlockModel extends DocumentBlockModel {
            client = client;
        }
        return new MyDocumentBlockModel(domain, id).getRenderableAll(resolveFileURL);
    }

    @toggle('uploading')
    async updateOneBlocks(id: string, markUpDown: string, user_id_type: UserIdType = 'open_id') {
        const { client, domain } = this;

        class MyDocumentBlockModel extends DocumentBlockModel {
            client = client;
        }
        const blockStore = new MyDocumentBlockModel(domain, id);

        await blockStore.removeAll();

        return blockStore.insert(markUpDown, 0, undefined, user_id_type);
    }
}
