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

export type I18nKey = `${string}_${string}`;

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
