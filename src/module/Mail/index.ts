import { Filter, IDType, ListModel, NewData, Stream, toggle } from 'mobx-restful';

import { LarkData } from '../../type';
import { createPageStream } from '../base';
import { MailMessage } from './type';

export * from './type';

export type MailMessageFilter = Filter<MailMessage> & {
    folder_id?: string;
    only_unread?: boolean;
};

export abstract class MailMessageModel extends Stream<MailMessage, MailMessageFilter>(ListModel) {
    baseURI = '';

    constructor(public mailboxId: string) {
        super();
        this.baseURI = `mail/v1/user_mailboxes/${mailboxId}/messages`;
    }

    /**
     * @see {@link https://open.feishu.cn/document/mail-v1/user_mailbox-message/list}
     */
    async *openStream(filter: MailMessageFilter = { folder_id: 'INBOX' }) {
        const stream = createPageStream<string>(
            this.client,
            this.baseURI,
            total => (this.totalCount = total),
            filter
        );
        for await (const message_id of stream) yield this.getOne(message_id);
    }

    /**
     * @see {@link https://open.feishu.cn/document/mail-v1/user_mailbox-message/get}
     */
    @toggle('downloading')
    async getOne(id: IDType) {
        const { body } = await this.client.get<LarkData<{ message: MailMessage }>>(
            `${this.baseURI}/${id}`
        );
        return (this.currentOne = body!.data!.message);
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/mail-v1/user_mailbox-message/send}
     */
    @toggle('uploading')
    async updateOne(mail: Partial<NewData<MailMessage>>) {
        const { body } = await this.client.post<
            LarkData<Record<`${'message' | 'thread'}_id`, string>>
        >(`${this.baseURI}/send`, mail);

        return (this.currentOne = await this.getOne(body!.data!.message_id));
    }
}
