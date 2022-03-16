import { Lark } from './Lark';
import { SpreadSheetMeta, SheetRangeData } from './type';

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

    async getMetaInfo() {
        if (!this.meta) {
            const { body } = await this.core.client.get<SpreadSheetMeta>(
                `${this.baseURI}/metainfo`
            );
            this.meta = body!.data;

            this.sheets = this.meta.sheets.map(
                ({ sheetId }) => new Sheet(this, sheetId)
            );
        }
        return this.meta;
    }
}

export class Sheet {
    document: SpreadSheet;
    id: string;

    constructor(document: SpreadSheet, id: string) {
        this.document = document;
        this.id = id;
    }

    async getData(startCell: string, endCell: string) {
        const { document } = this;

        const { body } = await document.core.client.get<SheetRangeData>(
            `${document.baseURI}/values/${this.id}!${startCell}:${endCell}`
        );
        return body!.data;
    }
}
