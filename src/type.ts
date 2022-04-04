export type LarkData<
    D extends Record<string, any> = {},
    E extends Record<string, any> = {}
> = E & {
    code: number;
    msg: string;
    data: D;
};

export type LarkPageData<D extends Record<string, any> = {}> = LarkData<{
    page_token: string;
    items: D[];
    has_more: boolean;
    total: number;
}>;

export function isLarkError(data?: any): data is LarkData {
    return !!(data as LarkData)?.code;
}

export type TenantAccessToken = LarkData<
    {},
    {
        expire: number;
        tenant_access_token: string;
    }
>;

export type UserMeta = LarkData<{
    token_type: 'Bearer';
    access_token: string;
    expires_in: number;
    name: string;
    en_name: string;
    avatar_url: string;
    avatar_thumb: string;
    avatar_middle: string;
    avatar_big: string;
    open_id: string;
    union_id: string;
    email: string;
    user_id: string;
    mobile: string;
    tenant_key: string;
    refresh_expires_in: number;
    refresh_token: string;
}>;

export type JSTicket = LarkData<{
    expire_in: number;
    ticket: string;
}>;

export type ChatPermission = 'all_members' | 'only_owner' | 'not_anyone';

export interface CreateChatMeta {
    owner_id: string;
    chat_mode: 'group';
    chat_type: 'private' | 'public';
    avatar: string;
    name: string;
    description: string;
    i18n_names: Record<`${string}_${string}`, string>;
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
    content: Record<string, any>;
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

export interface SheetMeta {
    sheetId: string;
    title: string;
    rowCount: number;
    frozenRowCount: number;
    columnCount: number;
    frozenColCount: number;
    index: number;
}

export type SpreadSheetMeta = LarkData<{
    spreadsheetToken: string;
    properties: {
        title: string;
        revision: number;
        ownerUser: number;
        sheetCount: number;
    };
    sheets: SheetMeta[];
}>;

export interface SheetCellMedia {
    type: 'url';
    cellPosition: null;
    text: string;
    link?: string;
}

export type SheetCellValue = string | number | SheetCellMedia[] | null;

export type SheetRangeData = LarkData<{
    revision: number;
    spreadsheetToken: string;
    valueRange: {
        revision: string;
        majorDimension: string;
        range: `${string}!${string}:${string}`;
        values: SheetCellValue[][];
    };
}>;

export type BITableMeta = LarkData<{
    app: {
        app_token: string;
        name: string;
        revision: number;
    };
}>;

export type BITableList = LarkPageData<{
    table_id: string;
    name: string;
    revision: number;
}>;

export type TableViewList = LarkPageData<{
    view_type: 'grid' | 'form';
    view_id: string;
    view_name: string;
}>;

export interface TableCellText {
    type: 'text';
    text: string;
}

export interface TableCellLink {
    type: 'url';
    link: string;
    text: string;
}

export interface TableCellMedia {
    file_token: string;
    name: string;
    type: `${string}/${string}`;
    size: number;
    url: string;
    tmp_url: string;
}

export interface TableCellUser {
    id: string;
    name: string;
    en_name: string;
    email: string;
}

export interface TableCellMetion {
    type: 'mention';
    mentionType: string;
    text: string;
}

export interface TableCellUserMetion extends TableCellMetion {
    token: string;
    mentionType: 'User';
    mentionNotify: boolean;
    name: string;
}

export interface TableCellDocumentMetion extends TableCellMetion {
    token: string;
    mentionType: 'Bitable';
    link: string;
}

export interface TableCellRelation extends TableCellText {
    table_id: string;
    record_ids: [string, string?];
}

export type TableCellValue =
    | string
    | number
    | boolean
    | TableCellLink
    | (
          | string
          | TableCellText
          | TableCellLink
          | TableCellMedia
          | TableCellUser
          | TableCellUserMetion
          | TableCellDocumentMetion
          | TableCellRelation
      )[]
    | null;

export type TableRecordFields = Record<string, TableCellValue>;

export type TableRecordList<D extends TableRecordFields = {}> = LarkPageData<{
    id?: string;
    record_id: string;
    fields: D;
}>;
