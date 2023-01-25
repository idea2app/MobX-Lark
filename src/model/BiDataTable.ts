import { DataObject, ListModel, NewData, Stream, toggle } from 'mobx-restful';
import { buildURLData, isEmpty } from 'web-utility';

import {
    TableCellLink,
    TableCellRelation,
    TableCellText,
    TableRecordData,
    TableRecordList
} from '../type';

/**
 * @see https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/filter
 */
export function makeSimpleFilter(
    data: DataObject,
    relation: 'AND' | 'OR' = 'AND'
) {
    const list = Object.entries(data)
        .map(
            ([key, value]) =>
                !isEmpty(value) &&
                (value instanceof Array ? value : [value]).map(
                    (item: string) =>
                        `CurrentValue.[${key}].contains("${item}")`
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

        async *openStream(filter: NewData<T>) {
            var lastPage = '';

            do {
                const { body } = await this.client.get<TableRecordList<T>>(
                    `${this.baseURI}?${buildURLData({
                        page_size: 100,
                        page_token: lastPage,
                        filter: this.makeFilter(filter),
                        sort: JSON.stringify(
                            Object.entries(this.sort).map(
                                ([key, order]) => `${key} ${order}`
                            )
                        )
                    })}`
                );
                var { items, total, has_more, page_token } = body!.data;

                lastPage = page_token;
                this.totalCount = total;

                yield* items.map(item => this.normalize(item));
            } while (has_more);
        }
    }
    return BiDataTableModel;
}
