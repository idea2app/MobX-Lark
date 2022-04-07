import { I18nKey } from '../../../type';
import { ChatMessageContent } from './message';

export * from './message';

export type ChatPermission = 'all_members' | 'only_owner' | 'not_anyone';

export interface CreateChatMeta {
    owner_id: string;
    chat_mode: 'group';
    chat_type: 'private' | 'public';
    avatar: string;
    name: string;
    description: string;
    i18n_names: Record<I18nKey, string>;
    user_id_list: string[];
    bot_id_list: string[];
    external: boolean;
    join_message_visibility: ChatPermission;
    leave_message_visibility: ChatPermission;
    membership_approval: 'no_approval_required' | 'approval_required';
}

export interface ChatMeta extends CreateChatMeta {
    tenant_key: string;
    owner_id_type: 'user_id';
    chat_id: string;
    chat_tag: 'inner';
    add_member_permission: ChatPermission;
    share_card_permission: 'allowed';
    at_all_permission: ChatPermission;
    edit_permission: ChatPermission;
    moderation_permission: ChatPermission;
}

export type ChatMessageType = 'text' | 'card';

export interface SendChatMessage {
    msg_type: ChatMessageType;
    content: ChatMessageContent;
    receive_id: string;
}

export interface ChatSender {
    id: string;
    id_type: 'open_id' | 'app_id';
    sender_type: 'app';
    tenant_key: string;
}

export interface ChatMetion
    extends Pick<ChatSender, 'id' | 'id_type' | 'tenant_key'> {
    key: string;
    name: string;
}

export interface ChatMessage extends Pick<SendChatMessage, 'msg_type'> {
    chat_id: string;
    message_id: string;
    upper_message_id: string;
    root_id: string;
    parent_id: string;
    create_time: string;
    update_time: string;
    deleted: boolean;
    updated: boolean;
    sender: ChatSender;
    mentions: ChatMetion[];
    body: {
        content: `${ChatMessageType}:${string}`;
    };
}
