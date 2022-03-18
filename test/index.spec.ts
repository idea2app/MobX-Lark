import 'dotenv/config';
import { describe, it } from 'web-utility';

import { Lark } from '../src';

const { APP_ID, APP_SECRET, SPREADSHEET_ID } = process.env;

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

    process.exit();
});
