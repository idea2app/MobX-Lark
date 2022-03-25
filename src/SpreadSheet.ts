import { List } from 'ts-toolbelt';

import { Lark } from './Lark';
import { SpreadSheetMeta, SheetMeta, SheetRangeData, CellValue } from './type';

export class SpreadSheet {
    core: Lark;
    id: string;

    get baseURI() {
        return `sheets/v2/spreadsheets/${this.id}`;
    }
    meta?: SpreadSheetMeta['data'];

    sheets: Sheet[] = [];

    constructor(core: Lark, id: string) {
        this.core = core;
        this.id = id;
    }

    /**
     * @see https://open.feishu.cn/document/ukTMukTMukTM/uETMzUjLxEzM14SMxMTN
     */
    async getMetaInfo() {
        if (!this.meta) {
            const { body } = await this.core.client.get<SpreadSheetMeta>(
                `${this.baseURI}/metainfo`
            );
            this.meta = body!.data;

            this.sheets = this.meta.sheets.map(
                meta => new Sheet(this, meta.sheetId, meta)
            );
        }
        return this.meta;
    }
}

export interface SheetQuery<K extends List.List> {
    columnRange: [string, string];
    keys: K;
    headerRows?: number;
    pageSize?: number;
    pageIndex?: number;
}

export type RowData<K extends List.List> = Record<List.UnionOf<K>, CellValue>;

export class Sheet {
    document: SpreadSheet;
    id: string;
    meta: SheetMeta;

    constructor(document: SpreadSheet, id: string, meta: SheetMeta) {
        this.document = document;
        this.id = id;
        this.meta = meta;
    }

    /**
     * @see https://open.feishu.cn/document/ukTMukTMukTM/ugTMzUjL4EzM14COxMTN
     */
    async getRange(startCell: string, endCell: string) {
        const { document } = this;

        const { body } = await document.core.client.get<SheetRangeData>(
            `${document.baseURI}/values/${
                this.id
            }!${startCell}:${endCell}?${new URLSearchParams({
                dateTimeRenderOption: 'FormattedString'
            })}`
        );
        return body!.data;
    }

    async getData<K extends List.List>({
        columnRange: [startColumn, endColumn],
        keys,
        headerRows = 1,
        pageSize = 10,
        pageIndex = 1
    }: SheetQuery<K>) {
        const start = 1 + headerRows + pageSize * (pageIndex - 1);
        const end = Math.min(this.meta.rowCount, start + pageSize - 1);

        if (end < start) return [];

        const {
            valueRange: { values }
        } = await this.getRange(`${startColumn}${start}`, `${endColumn}${end}`);

        return values.map(
            row =>
                Object.fromEntries(
                    row.map((value, index) => [keys[index], value])
                ) as RowData<K>
        );
    }
}
