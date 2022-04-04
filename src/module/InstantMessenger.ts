import { LarkModule } from './base';
import {
    LarkData,
    CreateChatMeta,
    ChatMeta,
    SendChatMessage,
    ChatMessage
} from '../type';

export class InstantMessenger extends LarkModule {
    get baseURI() {
        return 'im/v1';
    }
    chats: Chat[] = [];

    async createGroup(meta?: Partial<CreateChatMeta>) {
        const { body } = await this.core.client.post<LarkData<ChatMeta>>(
            `${this.baseURI}/chats?${new URLSearchParams({
                set_bot_manager: true + ''
            })}`,
            meta
        );
        const chat = new Chat(this, body!.data);

        this.chats.push(chat);

        return chat;
    }
}

export class Chat {
    messenger: InstantMessenger;
    meta: ChatMeta;

    constructor(messenger: InstantMessenger, meta: ChatMeta) {
        this.messenger = messenger;
        this.meta = meta;
    }

    async sendMessage({ content, ...data }: SendChatMessage) {
        const { body } = await this.messenger.core.client.post<
            LarkData<ChatMessage>
        >(
            `${this.messenger.baseURI}/messages?${new URLSearchParams({
                receive_id_type: 'chat_id'
            })}`,
            { ...data, content: JSON.stringify(content) }
        );

        return body!.data;
    }
}
