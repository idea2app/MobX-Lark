import { DataObject, ListModel, NewData, Stream, toggle } from 'mobx-restful';
import { isEmpty } from 'web-utility';

import {
    BITableList,
    TableCellLink,
    TableCellRelation,
    TableCellText,
    TableRecord,
    TableRecordData,
    TableRecordList,
    TableViewList
} from '../type';
import { createPageStream } from './base';

export type FilterOperator = '<' | '<=' | '=' | '!=' | '=>' | '>' | 'contains';

/**
 * @see https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/filter
 */
export function makeSimpleFilter(
    data: DataObject,
    operator: FilterOperator = 'contains',
    relation: 'AND' | 'OR' = 'AND'
) {
    const list = Object.entries(data)
        .map(
            ([key, value]) =>
                !isEmpty(value) &&
                (value instanceof Array ? value : [value]).map(
                    (item: string) =>
                        `CurrentValue.[${key}]` +
                        (operator === 'contains'
                            ? `.contains("${item}")`
                            : `${operator}${JSON.stringify(item)}`)
                )
        )
        .filter(Boolean)
        .flat() as string[];

    return list[1] ? `${relation}(${list})` : list[0];
}

export const normalizeText = (
    value: TableCellText | TableCellLink | TableCellRelation
) =>
    value && typeof value === 'object' && 'text' in value ? value.text : value;

/**
 * @see {@link https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/bitable-overview}
 */
export function BiDataTable<T extends DataObject>(Base = ListModel) {
    abstract class BiDataTableModel extends Stream<T>(Base) {
        sort: Partial<Record<keyof T, 'ASC' | 'DESC'>> = {};

        constructor(appId: string, tableId: string) {
            super();
            this.baseURI = `bitable/v1/apps/${appId}/tables/${tableId}/records`;
        }

        normalize({
            id,
            fields
        }: TableRecordList<T>['data']['items'][number]): T {
            return { ...fields, id: id! };
        }

        /**
         * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/get}
         */
        @toggle('downloading')
        async getOne(id: string) {
            const { body } = await this.client.get<TableRecordData<T>>(
                `${this.baseURI}/${id}`
            );
            return (this.currentOne = this.normalize(body!.data.record));
        }

        makeFilter(filter: NewData<T>) {
            return isEmpty(filter) ? undefined : makeSimpleFilter(filter);
        }

        /**
         * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/list}
         */
        async *openStream(filter: NewData<T>) {
            const stream = createPageStream<TableRecord<T>>(
                this.client,
                this.baseURI,
                total => (this.totalCount = total),
                {
                    filter: this.makeFilter(filter),
                    sort: JSON.stringify(
                        Object.entries(this.sort).map(
                            ([key, order]) => `${key} ${order}`
                        )
                    )
                }
            );
            for await (const item of stream) yield this.normalize(item);
        }
    }
    return BiDataTableModel;
}

export type TableViewItem = TableViewList['data']['items'][number];

export function BiTableView() {
    abstract class BiTableViewModel extends Stream<TableViewItem>(ListModel) {
        constructor(appId: string, tableId: string) {
            super();
            this.baseURI = `bitable/v1/apps/${appId}/tables/${tableId}/views`;
        }

        /**
         * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-view/list}
         */
        async *openStream() {
            for await (const item of createPageStream<TableViewItem>(
                this.client,
                this.baseURI,
                total => (this.totalCount = total)
            ))
                yield item;
        }
    }
    return BiTableViewModel;
}

export type BiDataTableClass<T extends DataObject> = ReturnType<
    typeof BiDataTable<T>
>;
export type BiTableItem = BITableList['data']['items'][number];

export function BiTable<T extends DataObject>() {
    abstract class BiTableModel extends Stream<BiTableItem>(ListModel) {
        constructor(public id: string) {
            super();
            this.baseURI = `bitable/v1/apps/${id}/tables`;
        }

        currentDataTable?: InstanceType<BiDataTableClass<T>>;

        async getOne(tableName: string, DataTableClass?: BiDataTableClass<T>) {
            const list = await this.getAll();

            const table = list.find(({ name }) => name === tableName);

            if (!table) throw new URIError(`Table "${tableName}" is not found`);

            if (DataTableClass instanceof Function)
                this.currentDataTable = Reflect.construct(DataTableClass, [
                    this.id,
                    table.table_id
                ]);
            return (this.currentOne = table);
        }

        /**
         * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/list}
         */
        async *openStream() {
            for await (const item of createPageStream<BiTableItem>(
                this.client,
                this.baseURI,
                total => (this.totalCount = total)
            ))
                yield item;
        }
    }
    return BiTableModel;
}
