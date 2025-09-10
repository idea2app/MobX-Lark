import { observable } from 'mobx';
import { DataObject, Filter, ListModel, PageData, RESTClient, Stream, toggle } from 'mobx-restful';
import { buildURLData, Constructor, isEmpty } from 'web-utility';

import { createPageStream } from '../base';
import { UserIdType } from '../User/type';
import {
    BITable,
    LarkFormData,
    TableFormView,
    TableRecord,
    TableRecordData,
    TableRecordFields,
    TableView
} from './type';
import { makeSimpleFilter } from './utility';

export * from './type';
export * from './utility';

export type BiBaseData = Omit<TableRecord<{}>, `record_${'id' | 'url'}` | 'fields'>;

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
export function BiDataTable<T extends DataObject, F extends Filter<T> = Filter<T>>(
    Base = ListModel
) {
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

        extractFields({ fields, ...meta }: TableRecord<T>): T {
            return { ...meta, ...fields };
        }

        /**
         * @deprecated
         */
        normalize = this.extractFields;

        wrapFields(fields: F) {
            return fields as unknown as T;
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
        async updateOne(data: F, id?: string) {
            const fields = this.wrapFields(data);

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
                        Object.fromEntries(this.requiredKeys.map(key => [key, ''])),
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
                          Object.entries(this.sort).map(([key, order]) => `${key} ${order}`)
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

            while (!this.noMore) await this.getViewList(viewId, undefined, pageSize);

            return this.allItems;
        }
    }
    return BiDataTableModel;
}

export type BiSearchFilter<D extends DataObject> = Filter<D> & {
    keywords?: string;
};

export function BiSearch<D extends DataObject, F extends BiSearchFilter<D> = BiSearchFilter<D>>(
    Model: Constructor<ListModel<D, F>>
) {
    abstract class BiSearchModel extends Model {
        declare baseURI: string;
        declare client: RESTClient;
        declare loadPage: (pageIndex: number, pageSize: number, filter: F) => Promise<PageData<D>>;

        abstract searchKeys: readonly (keyof TableRecordFields)[];

        @observable
        accessor keywords = '';

        makeFilter(filter: F) {
            return isEmpty(filter) ? '' : makeSimpleFilter(filter, 'contains', 'OR');
        }

        async getList(
            { keywords, ...filter }: F,
            pageIndex = this.pageIndex + 1,
            pageSize = this.pageSize
        ) {
            keywords = keywords?.trim();

            if (keywords) {
                const wordList = (this.keywords = keywords).split(/[\s,]+/);

                filter = Object.fromEntries(this.searchKeys.map(key => [key, wordList])) as F;
            }
            return super.getList(filter as F, pageIndex, pageSize);
        }

        /**
         * @deprecated since v2.4.2, use {@link getList} instead
         */
        async getSearchList(
            keywords: string,
            pageIndex = this.pageIndex + 1,
            pageSize = this.pageSize
        ) {
            return this.getList({ keywords } as F, pageIndex, pageSize);
        }
    }
    return BiSearchModel;
}

interface BiSearchModel extends InstanceType<ReturnType<typeof BiSearch<TableRecordFields, any>>> {}

export type BiSearchModelClass = Constructor<BiSearchModel>;

export function BiTableView<
    T extends TableView['view_type'],
    D extends T extends 'form' ? TableFormView : TableView
>(type = 'grid' as T) {
    abstract class BiTableViewModel extends Stream<D>(ListModel) {
        constructor(appId: string, tableId: string) {
            super();
            this.baseURI = `bitable/v1/apps/${appId}/tables/${tableId}/views`;
        }

        /**
         * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-view/list}
         * @see {@link https://open.feishu.cn/document/server-docs/docs/bitable-v1/form/get}
         */
        async *openStream() {
            for await (const item of createPageStream<TableView>(
                this.client,
                this.baseURI,
                total => (this.totalCount = total)
            ))
                if (type !== 'form') {
                    if (item.view_type === type) yield item as D;
                } else if (item.view_type === 'form') {
                    const { body } = await this.client.get<LarkFormData>(
                        this.baseURI.replace(/views$/, `forms/${item.view_id}`)
                    );
                    yield body!.data!.form as D;
                }
        }
    }
    return BiTableViewModel;
}

export type BiDataTableClass<T extends DataObject, F extends Filter<T> = Filter<T>> = ReturnType<
    typeof BiDataTable<T, F>
>;

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
