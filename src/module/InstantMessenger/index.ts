import { LarkData } from '../../type';
import { LarkModule } from '../base';
import { CreateChatMeta, ChatMeta, SendChatMessage, ChatMessage } from './type';

export * from './type';

export class InstantMessenger extends LarkModule {
    get baseURI() {
        return 'im/v1';
    }
    chats: Chat[] = [];

    protected cacheChat(meta: ChatMeta) {
        const chat = new Chat(this, meta);

        this.chats.push(chat);

        return chat;
    }

    /**
     * @see https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/create
     */
    async createGroup(meta?: Partial<CreateChatMeta>) {
        const { body } = await this.core.client.post<LarkData<ChatMeta>>(
            `${this.baseURI}/chats?${new URLSearchParams({
                set_bot_manager: true + ''
            })}`,
            meta
        );
        return this.cacheChat(body!.data);
    }

    async getChat(id: string) {
        const old = this.chats.find(({ meta }) => meta.chat_id === id);

        if (old) return old;

        const { body } = await this.core.client.get<LarkData<ChatMeta>>(
            `${this.baseURI}/chats/${id}`
        );
        return this.cacheChat(body!.data);
    }
}

export class Chat {
    messenger: InstantMessenger;
    meta: ChatMeta;

    constructor(messenger: InstantMessenger, meta: ChatMeta) {
        this.messenger = messenger;
        this.meta = meta;
    }

    /**
     * @see https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create
     */
    async sendMessage({
        msg_type,
        content
    }: Omit<SendChatMessage, 'receive_id'>) {
        const { body } = await this.messenger.core.client.post<
            LarkData<ChatMessage>
        >(
            `${this.messenger.baseURI}/messages?${new URLSearchParams({
                receive_id_type: 'chat_id'
            })}`,
            {
                receive_id: this.meta.chat_id,
                msg_type,
                content: JSON.stringify(content)
            }
        );
        return body!.data;
    }
}
