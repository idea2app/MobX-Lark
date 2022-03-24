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

export interface LarkMedia {
    type: 'url';
    cellPosition: null;
    text: string;
    link?: string;
}

export type CellValue = string | number | LarkMedia[] | null;

export type SheetRangeData = LarkData<{
    revision: number;
    spreadsheetToken: string;
    valueRange: {
        revision: string;
        majorDimension: string;
        range: `${string}!${string}:${string}`;
        values: CellValue[][];
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

export type TableRecordList = LarkPageData<{
    id: string;
    record_id: string;
    fields: Record<string, any>;
}>;
