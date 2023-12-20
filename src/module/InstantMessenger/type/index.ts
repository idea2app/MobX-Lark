import { I18nKey } from '../../../type';
import { ChatMessageContent } from './message';

export * from './message';

export type ChatPermission = 'all_members' | 'only_owner' | 'not_anyone';

export interface CreateChatMeta
    extends Record<'owner_id' | 'avatar' | 'name' | 'description', string>,
        Record<`${'join' | 'leave'}_message_visibility`, ChatPermission>,
        Record<`${'user' | 'bot'}_id_list`, string[]> {
    chat_mode: 'group';
    chat_type: 'private' | 'public';
    i18n_names: Record<I18nKey, string>;
    external: boolean;
    membership_approval: 'no_approval_required' | 'approval_required';
}

export interface ChatMeta
    extends CreateChatMeta,
        Record<'tenant_key' | 'chat_id', string>,
        Record<
            `${'add_member' | 'at_all' | 'edit' | 'moderation'}_permission`,
            ChatPermission
        > {
    owner_id_type: 'user_id';
    chat_tag: 'inner';
    share_card_permission: 'allowed';
}

export type ChatMessageType = 'text' | 'card';

export interface SendChatMessage {
    msg_type: ChatMessageType;
    content: ChatMessageContent;
    receive_id: string;
}

export interface ChatSender extends Record<'id' | 'tenant_key', string> {
    id_type: 'open_id' | 'app_id';
    sender_type: 'app';
}

export type ChatMetion = Pick<ChatSender, 'id' | 'id_type' | 'tenant_key'> &
    Record<'key' | 'name', string>;

export interface ChatMessage
    extends Pick<SendChatMessage, 'msg_type'>,
        Record<`${'create' | 'update'}_time`, string>,
        Record<'deleted' | 'updated', boolean>,
        Record<
            `${'chat' | 'message' | 'upper_message' | 'root' | 'parent'}_id`,
            string
        > {
    sender: ChatSender;
    mentions: ChatMetion[];
    body: {
        content: `${ChatMessageType}:${string}`;
    };
}
