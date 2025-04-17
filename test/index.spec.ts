import 'dotenv/config';
import { describe, it } from 'web-utility';

import {
    BiDataTable,
    BiTable,
    BiTableView,
    LarkApp,
    SpreadSheetModel,
    TableCellValue
} from '../src';

const {
    APP_ID,
    APP_SECRET,
    SPREADSHEET_ID,
    SHEET_ID,
    BITABLE_ID,
    BITABLE_TABLE_ID,
    MEDIA_ID
} = process.env;

const app = new LarkApp({ id: APP_ID!, secret: APP_SECRET! });

describe('MobX Lark SDK', async () => {
    await it('should get an Access Token', async expect => {
        const token = await app.getAccessToken();

        expect(/^t-\S+/.test(token));
    });

    const spreadSheet =
        await it('should get a Sheet Meta of a Spread Sheet document', async expect => {
            type Example = Record<'k1' | 'k2' | 'k3', any>;

            class ExampleSheetModel extends SpreadSheetModel<Example> {
                client = app.client;

                offset: [number, number] = [1, 7];

                columnKeys: (keyof Example)[] = ['k1', 'k2', 'k3'];
            }
            const spreadSheet = new ExampleSheetModel(
                SPREADSHEET_ID!,
                SHEET_ID!
            );
            await spreadSheet.getMeta();

            const { meta } = spreadSheet;

            expect(meta?.sheetId === SHEET_ID);

            return spreadSheet;
        });

    await it('should get a page of rows in a sheet', async expect => {
        const data = await spreadSheet.getList();

        expect(
            JSON.stringify(Object.keys(data[0])) ===
                JSON.stringify(spreadSheet.columnKeys)
        );
        console.log(JSON.stringify(data, null, 4));
    });

    await it('should get a page of tables in a BITable document', async expect => {
        class ExampleTableModel extends BiTable() {
            client = app.client;
        }
        const biTable = new ExampleTableModel(BITABLE_ID!);

        const [table] = await biTable.getList();

        expect(typeof table.table_id === 'string');

        return table!;
    });

    await it('should get a page of grids in a BITable table', async expect => {
        class ExampleTableGridModel extends BiTableView('grid') {
            client = app.client;
        }
        const gridView = new ExampleTableGridModel(
            BITABLE_ID!,
            BITABLE_TABLE_ID!
        );
        const list = await gridView.getList();

        expect(list.every(({ view_type }) => view_type === 'grid'));
    });

    await it('should get a page of forms in a BITable table', async expect => {
        class ExampleTableFormModel extends BiTableView('form') {
            client = app.client;
        }
        const formView = new ExampleTableFormModel(
            BITABLE_ID!,
            BITABLE_TABLE_ID!
        );
        const list = await formView.getList();

        expect(
            list.every(
                ({ submit_limit_once }) =>
                    typeof submit_limit_once === 'boolean'
            )
        );
    });

    await it('should get a page of records in a BITable table', async expect => {
        class ExampleDataTableModel extends BiDataTable<
            Record<'id' | 'name' | 'type', TableCellValue>
        >() {
            client = app.client;
        }
        const table = new ExampleDataTableModel(BITABLE_ID!, BITABLE_TABLE_ID!);

        const [record] = await table.getList();

        expect(typeof record.id === 'string');
    });

    await it('should download a file', async expect => {
        const { size } = await app.downloadFile(MEDIA_ID!);

        expect(size > 0);
    });
}).finally(() => process.exit());
