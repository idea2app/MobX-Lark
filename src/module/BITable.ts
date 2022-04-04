import { buildURLData } from 'web-utility';

import { LarkModule } from './base';
import {
    BITableMeta,
    BITableList,
    TableViewList,
    TableRecordList,
    TableRecordFields
} from '../type';

export class BITable extends LarkModule {
    get baseURI() {
        return `bitable/v1/apps/${this.id}`;
    }
    meta?: BITableMeta['data']['app'];

    tables: Table[] = [];

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
    async getTables<D extends TableRecordFields = {}>() {
        const { body } = await this.core.client.get<BITableList>(
            `${this.baseURI}/tables?page_size=100`
        );
        return (this.tables = body!.data.items.map(
            ({ table_id }) => new Table<D>(this, table_id)
        ));
    }

    async getTable<D extends TableRecordFields = {}>(id: string) {
        if (!this.tables[0]) await this.getTables<D>();

        return this.tables.find(({ id: ID }) => ID === id) as
            | Table<D>
            | undefined;
    }
}

export class Table<D extends TableRecordFields = {}> {
    document: BITable;
    id: string;

    get baseURI() {
        return `${this.document.baseURI}/tables/${this.id}`;
    }
    views: TableViewList['data']['items'] = [];

    records: ({ id: string } & D)[] = [];
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
    async getNextPage(text2array?: boolean) {
        const { body } = await this.document.core.client.get<
            TableRecordList<D>
        >(
            `${this.baseURI}/records?${buildURLData({
                text_field_as_array: text2array,
                page_size: 100,
                page_token: this.lastPage
            })}`
        );
        const { items, page_token, has_more, total } = body!.data;

        const list = items.map(
            ({ id, record_id, fields }) =>
                ({
                    id: id || record_id,
                    ...fields
                } as { id: string } & D)
        );
        this.records.push(...list);

        this.lastPage = page_token;
        this.hasMore = has_more;
        this.totalCount = total;

        return list;
    }

    async getAllRecords(text2array?: boolean) {
        do {
            await this.getNextPage(text2array);
        } while (this.hasMore);

        return this.records;
    }
}
