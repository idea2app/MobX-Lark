import { Lark } from './Lark';
import {
    BITableMeta,
    BITableList,
    TableViewList,
    TableRecordList
} from './type';

export class BITable {
    core: Lark;
    id: string;

    get baseURI() {
        return `bitable/v1/apps/${this.id}`;
    }
    meta?: BITableMeta['data']['app'];

    tables: Table[] = [];

    constructor(core: Lark, id: string) {
        this.core = core;
        this.id = id;
    }

    async getMetaInfo() {
        if (!this.meta) {
            const { body } = await this.core.client.get<BITableMeta>(
                this.baseURI
            );
            this.meta = body!.data.app;
        }
        await this.getTables();

        return this.meta;
    }

    async getTables() {
        const { body } = await this.core.client.get<BITableList>(
            `${this.baseURI}/tables?page_size=100`
        );
        return (this.tables = body!.data.items.map(
            ({ table_id }) => new Table(this, table_id)
        ));
    }

    async getTable(id: string) {
        if (!this.tables[0]) await this.getTables();

        return this.tables.find(({ id: ID }) => ID === id);
    }
}

export class Table {
    document: BITable;
    id: string;

    get baseURI() {
        return `${this.document.baseURI}/tables/${this.id}`;
    }
    views: any[] = [];

    constructor(document: BITable, id: string) {
        this.document = document;
        this.id = id;
    }

    async getViews() {
        const { body } = await this.document.core.client.get<TableViewList>(
            `${this.baseURI}/views?page_size=100`
        );
        return (this.views = body!.data.items);
    }

    async getRecords() {
        const { body } = await this.document.core.client.get<TableRecordList>(
            `${this.baseURI}/records?page_size=100`
        );
        return body!.data.items;
    }
}
