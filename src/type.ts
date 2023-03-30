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
    total?: number;
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

export type LocaleUser = Record<`${'' | 'en_'}name` | 'email', string>;

export type UserMeta = LarkData<
    { token_type: 'Bearer' } & LocaleUser &
        Record<
            | `avatar_${'url' | 'thumb' | 'middle' | 'big'}`
            | `${'open' | 'union' | 'user'}_id`
            | 'mobile'
            | 'tenant_key'
            | `${'access' | 'refresh'}_token`,
            string
        > &
        Record<`${'' | 'refresh_'}expires_in`, number>
>;

export type JSTicket = LarkData<{
    expire_in: number;
    ticket: string;
}>;

export type I18nKey = `${string}_${string}`;

export type SheetMeta = Record<'sheetId' | 'title', string> &
    Record<
        `${'row' | 'column'}Count` | `frozen${'Row' | 'Col'}Count` | 'index',
        number
    >;

export type SpreadSheetMeta = LarkData<{
    spreadsheetToken: string;
    properties: {
        title: string;
    } & Record<'revision' | 'ownerUser' | 'sheetCount', number>;
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
    valueRange: Record<'revision' | 'majorDimension', string> & {
        range: `${string}!${string}:${string}`;
        values: SheetCellValue[][];
    };
}>;

export interface RevisionTable {
    name: string;
    revision: number;
}

export type BITableMeta = LarkData<{
    app: { app_token: string } & RevisionTable;
}>;

export type BITableList = LarkPageData<{ table_id: string } & RevisionTable>;

export type TableViewList = LarkPageData<
    { view_type: 'grid' | 'form' } & Record<'view_id' | 'view_name', string>
>;

export interface TableCellText {
    type: 'text';
    text: string;
}

export interface TableCellLink extends Record<'link' | 'text', string> {
    type: 'url';
}

export interface TableCellMedia
    extends Record<'file_token' | 'name' | `${'' | 'tmp_'}url`, string> {
    type: `${string}/${string}`;
    size: number;
}

export interface TableCellAttachment
    extends Pick<TableCellMedia, 'name' | 'size'>,
        Record<'id' | 'attachmentToken', string>,
        Record<'height' | 'timeStamp' | 'width', number> {
    mimeType: TableCellMedia['type'];
}

export interface TableCellUser extends LocaleUser {
    id: string;
}

export interface TableCellMetion
    extends Record<'mentionType' | 'text', string> {
    type: 'mention';
}

export interface TableCellUserMetion
    extends TableCellMetion,
        Record<'name' | 'token', string> {
    mentionType: 'User';
    mentionNotify: boolean;
}

export interface TableCellDocumentMetion
    extends TableCellMetion,
        Record<'link' | 'token', string> {
    mentionType: 'Bitable';
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
          | TableCellAttachment
          | TableCellUser
          | TableCellUserMetion
          | TableCellDocumentMetion
          | TableCellRelation
      )[]
    | null;

export type TableRecordFields = Record<string, TableCellValue>;

export interface TableRecord<T extends TableRecordFields>
    extends Record<'id' | 'record_id', string> {
    created_by: TableCellUser;
    created_time: number;
    last_modified_by?: TableCellUser;
    last_modified_time?: number;
    fields: T;
}

export type TableRecordData<T extends TableRecordFields> = LarkData<{
    record: TableRecord<T>;
}>;

export type TableRecordList<D extends TableRecordFields = {}> = LarkPageData<
    TableRecord<D>
>;
