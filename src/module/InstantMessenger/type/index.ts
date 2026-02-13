import { TranslationMap } from '../../../type';
import { UserIdType } from '../../User/type';
import { ChatMessageContent } from './message';

export * from './message';

export type ChatPermission = 'all_members' | 'only_owner' | 'not_anyone';

export type ChatManagerPermission = Exclude<ChatPermission, 'not_anyone'>;

export type ChatMemberPermission = Exclude<ChatPermission, 'only_owner'>;

export interface RestrictedModeSetting extends Partial<
    Record<`${'screenshot' | 'download' | 'message'}_has_permission_setting`, ChatMemberPermission>
> {
    status?: boolean;
}

export interface CreateChatMeta
    extends
        Record<'owner_id' | 'avatar' | 'name' | 'description', string>,
        Record<`${'join' | 'leave'}_message_visibility`, ChatPermission>,
        Record<`${'user' | 'bot'}_id_list`, string[]>,
        Record<
            `${'urgent' | 'video_conference' | 'hide_member_count'}_setting` | 'edit_permission',
            ChatManagerPermission
        > {
    chat_mode: 'group';
    chat_type: 'private' | 'public';
    group_message_type: 'chat' | 'thread';
    i18n_names: TranslationMap;
    membership_approval: `${'no_' | ''}approval_required`;
    restricted_mode_setting: RestrictedModeSetting;
}

export interface CreateChatOption {
    user_id_type?: UserIdType;
    set_bot_manager?: boolean;
    uuid?: string;
}

export interface ChatMeta
    extends
        CreateChatMeta,
        Record<'tenant_key' | 'chat_id', string>,
        Record<`${'add_member' | 'at_all' | 'moderation'}_permission`, ChatPermission> {
    owner_id_type: UserIdType;
    chat_tag: 'inner' | 'tenant' | 'department' | 'edu' | 'meeting' | 'customer_service';
    external: boolean;
    share_card_permission: `${'not_' | ''}allowed`;
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
    extends
        Pick<SendChatMessage, 'msg_type'>,
        Record<`${'create' | 'update'}_time`, string>,
        Record<'deleted' | 'updated', boolean>,
        Record<`${'chat' | 'message' | 'upper_message' | 'root' | 'parent'}_id`, string> {
    sender: ChatSender;
    mentions: ChatMetion[];
    body: {
        content: `${ChatMessageType}:${string}`;
    };
}
