import { BaseListModel } from 'mobx-restful';

import { createPageStream } from '../base';
import { Block, Document } from './type';

export * from './type';
export * from './component';

export abstract class DocumentModel extends BaseListModel<Document> {
    baseURI = 'docx/v1/documents';

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document/list}
     */
    async getOneBlocks(id: string) {
        const stream = createPageStream<Block<any, any, any>>(
            this.client,
            `docx/v1/documents/${id}/blocks`,
            total => void total
        );
        return await Array.fromAsync(stream);
    }
}
