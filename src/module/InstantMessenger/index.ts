import { ListModel, NewData, Stream, toggle } from 'mobx-restful';
import { buildURLData } from 'web-utility';

import { LarkData } from '../../type';
import { createPageStream } from '../base';
import { ChatMessage, ChatMeta, CreateChatOption, SendChatMessage } from './type';

export * from './type';

export abstract class ChatListModel extends Stream<ChatMeta>(ListModel) {
    baseURI = 'im/v1/chats';

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/list}
     */
    openStream() {
        return createPageStream<ChatMeta>(
            this.client,
            this.baseURI,
            total => (this.totalCount = total)
        );
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/group/chat/create}
     * @see {@link https://open.feishu.cn/document/server-docs/group/chat/update-2}
     */
    @toggle('uploading')
    async updateOne({ chat_id, ...data }: NewData<ChatMeta>, option: CreateChatOption = {}) {
        const { body } = await (chat_id
            ? this.client.put<LarkData<ChatMeta>>(`${this.baseURI}/${chat_id}`, data)
            : this.client.post<LarkData<ChatMeta>>(
                  `${this.baseURI}?${buildURLData(option)}`,
                  data
              ));
        return (this.currentOne = body!.data!);
    }
}

export abstract class MessageListModel extends Stream<ChatMessage>(ListModel) {
    baseURI = 'im/v1/messages';

    constructor(public chatId: string) {
        super();
    }

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/list}
     */
    openStream() {
        return createPageStream<ChatMessage>(
            this.client,
            this.baseURI,
            total => (this.totalCount = total)
        );
    }

    /**
     * @see https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create
     */
    @toggle('uploading')
    async createOne({ msg_type, content }: Omit<SendChatMessage, 'receive_id'>) {
        const { body } = await this.client.post<LarkData<ChatMessage>>(
            `${this.baseURI}?${buildURLData({
                receive_id_type: 'chat_id'
            })}`,
            {
                receive_id: this.chatId,
                msg_type,
                content: JSON.stringify(content)
            }
        );
        return (this.currentOne = body!.data!);
    }
}
