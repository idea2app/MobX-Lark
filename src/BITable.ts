import { buildURLData } from 'web-utility';

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

    /**
     * @see https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/get
     */
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

    /**
     * @see https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/list
     */
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
    views: TableViewList['data']['items'] = [];

    records: TableRecordList['data']['items'] = [];
    lastPage?: string;
    hasMore?: boolean;
    totalCount?: number;

    constructor(document: BITable, id: string) {
        this.document = document;
        this.id = id;
    }

    /**
     * @see https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-view/list
     */
    async getViews() {
        const { body } = await this.document.core.client.get<TableViewList>(
            `${this.baseURI}/views?page_size=100`
        );
        return (this.views = body!.data.items);
    }

    /**
     * @see https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/list
     */
    async getNextPage() {
        const { body } = await this.document.core.client.get<TableRecordList>(
            `${this.baseURI}/records?${buildURLData({
                page_size: 100,
                page_token: this.lastPage
            })}`
        );
        const { items, page_token, has_more, total } = body!.data;

        this.records.push(...items);

        this.lastPage = page_token;
        this.hasMore = has_more;
        this.totalCount = total;

        return items;
    }

    async getAllRecords() {
        do {
            await this.getNextPage();
        } while (this.hasMore);

        return this.records;
    }
}
