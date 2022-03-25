import 'dotenv/config';
import { describe, it } from 'web-utility';

import { Lark, Table } from '../src';

const {
    APP_ID,
    APP_SECRET,
    SPREADSHEET_ID,
    BITABLE_ID,
    BITABLE_TABLE_ID,
    MEDIA_ID
} = process.env;

const app = new Lark({
    appId: APP_ID!,
    appSecret: APP_SECRET!
});

describe('Lark SDK', async () => {
    await it('should get an Access Token', async expect => {
        const token = await app.getAccessToken();

        expect(/^t-\S+/.test(token));
    });

    const spreadSheet =
        await it('should get Meta data of a SpreadSheet document', async expect => {
            const spreadSheet = await app.getSpreadSheet(SPREADSHEET_ID!);

            const { meta } = spreadSheet;

            expect(typeof meta?.sheets[0]?.sheetId === 'string');

            return spreadSheet;
        });

    await it('should get a row of the first sheet', async expect => {
        const [sheet] = spreadSheet.sheets;

        const data = await sheet.getData({
            columnRange: ['G', 'R'],
            keys: Array.from(new Array(12), (_, index) => `k${++index}`)
        });
        expect(data instanceof Array);

        console.log(JSON.stringify(data, null, 4));
    });

    const biTable =
        await it('should get Meta data of a BITable document', async expect => {
            const biTable = await app.getBITable(BITABLE_ID!);

            const { meta, id, tables } = biTable;

            expect(meta?.app_token === id);
            expect(tables[0] instanceof Table);

            return biTable;
        });

    const table =
        await it('should get a table of a BITable document', async expect => {
            const table = await biTable.getTable<{ name: string }>(
                BITABLE_TABLE_ID!
            );
            expect(table instanceof Table);

            return table!;
        });

    await it('should get all views of a BITable table', async expect => {
        const [view] = await table.getViews();

        expect(['grid', 'form'].includes(view.view_type));
    });

    await it('should get a page of records in a BITable view', async expect => {
        const [record] = await table.getNextPage();

        expect(typeof record.id === 'string');
    });

    await it('should download a file', async expect => {
        const file = await app.downloadFile(MEDIA_ID!);

        expect(file.size > 0);
    });
}).then(() => process.exit());
