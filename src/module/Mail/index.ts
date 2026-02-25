import { Filter, IDType, ListModel, NewData, Stream, toggle } from 'mobx-restful';

import { LarkData } from '../../type';
import { createPageStream } from '../base';
import { MailMessage, MailMessageSummary, SendMailMessage } from './type';

export * from './type';

export type MailMessageFilter = Filter<MailMessage>;

export abstract class MailMessageModel extends Stream<MailMessage, MailMessageFilter>(ListModel) {
    baseURI: string;

    constructor(public mailboxId: string) {
        super();
        this.baseURI = `mail/v1/user_mailboxes/${mailboxId}/messages`;
    }

    /**
     * @see {@link https://open.feishu.cn/document/mail-v1/user_mailbox-message/list}
     */
    async *openStream(filter: MailMessageFilter = {}) {
        const stream = createPageStream<MailMessageSummary>(
            this.client,
            this.baseURI,
            total => (this.totalCount = total),
            filter
        );
        for await (const { message_id } of stream) yield await this.getOne(message_id);
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
    async updateOne(mail: NewData<MailMessage>) {
        const { body } = await this.client.post<LarkData<{ message: MailMessage }>>(
            `${this.baseURI}/send`,
            mail as SendMailMessage
        );
        return (this.currentOne = body!.data!.message);
    }
}
