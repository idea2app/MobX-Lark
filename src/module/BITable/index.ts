import { DataObject, Filter, ListModel, Stream, toggle } from 'mobx-restful';
import { buildURLData, isEmpty } from 'web-utility';

import { UserIdType } from '../../type';
import { createPageStream } from '../base';
import {
    BITable,
    TableCellLink,
    TableCellRelation,
    TableCellText,
    TableRecord,
    TableRecordData,
    TableView
} from './type';

export * from './type';

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
                value != null &&
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
    (value && typeof value === 'object' && 'text' in value && value.text) || '';

export type BiBaseData = Omit<TableRecord<{}>, 'record_id' | 'fields'>;

export interface BiDataQueryOptions {
    text_field_as_array?: boolean;
    automatic_fields?: boolean;
    display_formula_ref?: boolean;
    with_shared_url?: boolean;
    user_id_type?: UserIdType;
}

/**
 * @see {@link https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/bitable-overview}
 */
export function BiDataTable<
    T extends DataObject,
    F extends Filter<T> = Filter<T>
>(Base = ListModel) {
    abstract class BiDataTableModel extends Stream<T, F>(Base) {
        requiredKeys: readonly (keyof T)[] = [];

        sort: Partial<Record<keyof T, 'ASC' | 'DESC'>> = {};

        queryOptions: BiDataQueryOptions = {
            text_field_as_array: true,
            automatic_fields: true
        };
        currentViewId?: string;

        constructor(appId: string, tableId: string) {
            super();
            this.baseURI = `bitable/v1/apps/${appId}/tables/${tableId}/records`;
        }

        normalize({ fields, ...meta }: TableRecord<T>): T {
            return { ...meta, ...fields };
        }

        /**
         * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/get}
         */
        @toggle('downloading')
        async getOne(id: string) {
            const { body } = await this.client.get<TableRecordData<T>>(
                `${this.baseURI}/${id}?${buildURLData(this.queryOptions)}`
            );
            return (this.currentOne = this.normalize(body!.data!.record));
        }

        /**
         * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/create}
         * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/update}
         */
        @toggle('uploading')
        async updateOne(fields: F, id?: string) {
            const { body } = await (id
                ? this.client.put<TableRecordData<T>>(`${this.baseURI}/${id}`, {
                      fields
                  })
                : this.client.post<TableRecordData<T>>(this.baseURI, {
                      fields
                  }));
            return (this.currentOne = this.normalize(body!.data!.record));
        }

        makeFilter(filter: F) {
            return [
                this.requiredKeys[0] &&
                    makeSimpleFilter(
                        Object.fromEntries(
                            this.requiredKeys.map(key => [key, ''])
                        ),
                        '!='
                    ),
                !isEmpty(filter) && makeSimpleFilter(filter)
            ]
                .filter(Boolean)
                .join('&&');
        }

        /**
         * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/list}
         */
        async *openStream(filter: F) {
            const view_id = this.currentViewId;
            const searchParams = view_id
                ? { view_id }
                : {
                      filter: this.makeFilter(filter),
                      sort: JSON.stringify(
                          Object.entries(this.sort).map(
                              ([key, order]) => `${key} ${order}`
                          )
                      )
                  };
            const stream = createPageStream<TableRecord<T>>(
                this.client,
                this.baseURI,
                total => (this.totalCount = total),
                { ...searchParams, ...this.queryOptions }
            );
            for await (const item of stream) yield this.normalize(item);
        }

        async getViewList(
            viewId: string,
            pageIndex = this.pageIndex + 1,
            pageSize = this.pageSize
        ) {
            try {
                this.currentViewId = viewId;

                return await this.getList({} as F, pageIndex, pageSize);
            } finally {
                this.currentViewId = undefined;
            }
        }

        async getViewAll(viewId: string, pageSize = this.pageSize) {
            this.clearList();

            while (!this.noMore)
                await this.getViewList(viewId, undefined, pageSize);

            return this.allItems;
        }
    }
    return BiDataTableModel;
}

export function BiTableView() {
    abstract class BiTableViewModel extends Stream<TableView>(ListModel) {
        constructor(appId: string, tableId: string) {
            super();
            this.baseURI = `bitable/v1/apps/${appId}/tables/${tableId}/views`;
        }

        /**
         * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-view/list}
         */
        async *openStream() {
            for await (const item of createPageStream<TableView>(
                this.client,
                this.baseURI,
                total => (this.totalCount = total)
            ))
                yield item;
        }
    }
    return BiTableViewModel;
}

export type BiDataTableClass<
    T extends DataObject,
    F extends Filter<T> = Filter<T>
> = ReturnType<typeof BiDataTable<T, F>>;

export function BiTable() {
    abstract class BiTableModel extends Stream<BITable>(ListModel) {
        constructor(public id: string) {
            super();
            this.baseURI = `bitable/v1/apps/${id}/tables`;
        }

        currentDataTable?: ListModel<any>;

        async getOne<T extends DataObject, F extends Filter<T>>(
            tableName: string,
            DataTableClass?: BiDataTableClass<T, F>
        ) {
            const { allItems } = this;

            const list = allItems[0] ? allItems : await this.getAll();

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
            for await (const item of createPageStream<BITable>(
                this.client,
                this.baseURI,
                total => (this.totalCount = total)
            ))
                yield item;
        }
    }
    return BiTableModel;
}
