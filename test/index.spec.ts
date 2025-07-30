import 'dotenv/config';
import { outputFile, outputJSON } from 'fs-extra';
import { renderToStaticMarkup } from 'react-dom/server';
import Turndown from 'turndown';
import { describe, it } from 'web-utility';

import {
    BiDataTable,
    BiTable,
    BiTableView,
    Block,
    DocumentModel,
    LarkApp,
    renderBlocks,
    SpreadSheetModel,
    TableCellValue,
    WikiModel,
    WikiNodeModel
} from '../src';

const {
    APP_ID,
    APP_SECRET,
    DOCUMENT_WIKI_ID,
    SPREADSHEET_WIKI_ID,
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

    const wiki = await it('should get a Wiki list', async expect => {
        class MyWikiModel extends WikiModel {
            client = app.client;
        }
        const wikiList = await new MyWikiModel().getList();

        expect(wikiList[0]?.open_sharing === 'open');
        expect(wikiList[0]?.visibility === 'public');
        expect(wikiList[0]?.space_type === 'team');

        return wikiList[0];
    });

    class MyWikiNodeModel extends WikiNodeModel {
        client = app.client;
    }
    const wikiNodeStore = new MyWikiNodeModel('idea2app.feishu.cn', wiki.space_id);

    await it('should get a Wiki Node tree with iterator', async expect => {
        const allNodes = await wikiNodeStore.getAll();

        expect(allNodes.length > 0);

        console.log(allNodes);
    }, 10);

    const blocks = await it('should get blocks of a Document', async expect => {
        class MyDocumentModel extends DocumentModel {
            client = app.client;
        }
        const { obj_token } = await wikiNodeStore.getOne(DOCUMENT_WIKI_ID!);

        const blocks: Block<any, any, any>[] = await new MyDocumentModel().getOneBlocks(obj_token);

        expect('block_type' in blocks[0] && 'block_id' in blocks[0]);

        console.log(blocks);

        return blocks;
    });

    await it('should render a Document with React JSX', async expect => {
        const { vDOM, files } = renderBlocks(blocks);

        expect('type' in vDOM && 'key' in vDOM && 'props' in vDOM);
        expect(files.length > 0);

        console.log(files, vDOM);

        const markup = renderToStaticMarkup(vDOM);
        const markdown = new Turndown().turndown(markup);

        expect(markup.includes('<article>'));

        await outputJSON('test/output/index.json', blocks);
        await outputFile('test/output/index.html', markup);
        await outputFile('test/output/index.md', markdown);
        await outputJSON('test/output/files.json', files);
    });

    const spreadSheetWikiNode =
        await it('should get a Wiki Node of a Spread Sheet document', async expect => {
            const node = await wikiNodeStore.getOne(SPREADSHEET_WIKI_ID!);

            expect(node.obj_type === 'sheet');

            return node;
        });

    const spreadSheet =
        await it('should get a Sheet Meta of a Spread Sheet document', async expect => {
            type Example = Record<'k1' | 'k2' | 'k3', any>;

            class ExampleSheetModel extends SpreadSheetModel<Example> {
                client = app.client;

                offset: [number, number] = [1, 7];

                columnKeys: (keyof Example)[] = ['k1', 'k2', 'k3'];
            }
            const spreadSheet = new ExampleSheetModel(spreadSheetWikiNode.obj_token, SHEET_ID!);

            await spreadSheet.getMeta();

            const { meta } = spreadSheet;

            expect(meta?.sheetId === SHEET_ID);

            return spreadSheet;
        });

    await it('should get a page of rows in a sheet', async expect => {
        const data = await spreadSheet.getList();

        expect(JSON.stringify(Object.keys(data[0])) === JSON.stringify(spreadSheet.columnKeys));

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
        const gridView = new ExampleTableGridModel(BITABLE_ID!, BITABLE_TABLE_ID!);

        const list = await gridView.getList();

        expect(list.every(({ view_type }) => view_type === 'grid'));
    });

    await it('should get a page of forms in a BITable table', async expect => {
        class ExampleTableFormModel extends BiTableView('form') {
            client = app.client;
        }
        const formView = new ExampleTableFormModel(BITABLE_ID!, BITABLE_TABLE_ID!);

        const list = await formView.getList();

        expect(list.every(({ submit_limit_once }) => typeof submit_limit_once === 'boolean'));
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
}).then(
    () => process.exit(),
    error => {
        console.error(error);
        process.exit(1);
    }
);
