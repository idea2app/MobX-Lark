import { LarkData, LocaleUser } from '../../type';

export interface RevisionTable {
    name: string;
    revision: number;
}

export interface BITable extends RevisionTable {
    table_id: string;
}

export interface TableView extends Record<'view_id' | 'view_name', string> {
    view_type: 'grid' | 'kanban' | 'gallery' | 'gantt' | 'form';
}

export interface TableFormView
    extends Record<'name' | 'description' | 'shared_url', string>,
        Record<'shared' | 'submit_limit_once', boolean> {
    shared_limit: 'tenant_editable';
}

export type LarkFormData = LarkData<{ form: TableFormView }>;

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

export type TableCellGroup = Record<'id' | 'name' | 'avatar_url', string>;

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

export type TableCellObject =
    | TableCellLocation
    | TableCellText
    | TableCellLink
    | TableCellMedia
    | TableCellAttachment
    | TableCellUser
    | TableCellGroup
    | TableCellUserMetion
    | TableCellDocumentMetion
    | TableCellRelation;

export type TableCellValue =
    | string
    | number
    | boolean
    | TableCellObject
    | (string | TableCellObject)[]
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
