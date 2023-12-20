import { LarkData, LarkPageData, LocaleUser } from '../../type';

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

export type TableCellLocation = Record<
    | 'name'
    | 'pname'
    | 'cityname'
    | 'adname'
    | 'address'
    | 'full_address'
    | 'location',
    string
>;

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
    record_ids: string[];
    text_arr: string[];
}

export type TableCellValue =
    | string
    | number
    | boolean
    | TableCellLocation
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
