import { observable } from 'mobx';
import { DataObject, ListModel, NewData, toggle } from 'mobx-restful';
import { buildURLData, objectFrom } from 'web-utility';

import { LarkData } from '../../type';
import { SheetMeta, SpreadSheetMeta, SpreadSheetRange } from './type';

export * from './type';

export abstract class SpreadSheetModel<
    D extends DataObject,
    F extends NewData<D> = NewData<D>
> extends ListModel<D, F> {
    baseURI = '';

    offset: [number, number] = [0, 0];

    abstract columnKeys: (keyof D)[];

    @observable
    accessor meta: SheetMeta | undefined;

    constructor(
        public id: string,
        public sheetId: string
    ) {
        super();
        this.baseURI = `sheets/v2/spreadsheets/${id}`;
    }

    /**
     * @see {@link https://open.feishu.cn/document/ukTMukTMukTM/uETMzUjLxEzM14SMxMTN}
     */
    @toggle('downloading')
    async getMeta() {
        if (this.meta) return this.meta;

        const { body } = await this.client.get<LarkData<SpreadSheetMeta>>(
                `${this.baseURI}/metainfo`
            ),
            { sheetId } = this;

        const sheet = body!.data!.sheets.find(
            ({ sheetId: ID }) => ID === sheetId
        );
        console.assert(sheet, `Sheet "${sheetId}" is not found`);

        return (this.meta = sheet!);
    }

    /**
     * @see {@link https://open.feishu.cn/document/ukTMukTMukTM/ugTMzUjL4EzM14COxMTN}
     */
    async loadPage(pageIndex: number, pageSize: number, filter: NewData<D>) {
        const { columnKeys } = this,
            [rowOff, columnOff] = this.offset,
            { rowCount } = await this.getMeta();

        const startRow = rowOff + 1,
            startColumnNumber = 'A'.charCodeAt(0) + columnOff;
        const endRow = Math.min(startRow - 1 + pageSize * pageIndex, rowCount),
            endColumnNumber = startColumnNumber - 1 + columnKeys.length;
        const startColumn = String.fromCharCode(startColumnNumber),
            endColumn = String.fromCharCode(endColumnNumber);

        const { body } = await this.client.get<LarkData<SpreadSheetRange>>(
            `${this.baseURI}/values/${
                this.sheetId
            }!${startColumn}${startRow}:${endColumn}${endRow}?${buildURLData({
                dateTimeRenderOption: 'FormattedString'
            })}`
        );
        const pageData = body!.data!.valueRange.values.map(
            row => objectFrom(row, columnKeys as string[]) as D
        );
        return { pageData, totalCount: rowCount - rowOff };
    }
}
