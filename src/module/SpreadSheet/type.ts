export type SheetMeta = Record<'sheetId' | 'title', string> &
    Record<
        `${'row' | 'column'}Count` | `frozen${'Row' | 'Col'}Count` | 'index',
        number
    >;

export interface SpreadSheetMeta {
    spreadsheetToken: string;
    properties: {
        title: string;
    } & Record<'revision' | 'ownerUser' | 'sheetCount', number>;
    sheets: SheetMeta[];
}

export interface SheetCellMedia {
    type: 'url';
    cellPosition: null;
    text: string;
    link?: string;
}

export type SheetCellValue = string | number | SheetCellMedia[] | null;

export interface SpreadSheetRange {
    revision: number;
    spreadsheetToken: string;
    valueRange: Record<'revision' | 'majorDimension', string> & {
        range: `${string}!${string}:${string}`;
        values: SheetCellValue[][];
    };
}
