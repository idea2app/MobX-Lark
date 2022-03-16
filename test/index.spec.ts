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
            const spreadSheet = app.getSpreadSheet(SPREADSHEET_ID!);

            const { sheets } = await spreadSheet.getMetaInfo();

            expect(typeof sheets[0]?.sheetId === 'string');

            return spreadSheet;
        });

    await it('should get a row of the first sheet', async expect => {
        const [sheet] = spreadSheet.sheets;

        const {
            valueRange: { values }
        } = await sheet.getData('A1', 'U1');

        expect(values instanceof Array);
    });
});
