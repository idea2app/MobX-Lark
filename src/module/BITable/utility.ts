import { DataObject } from 'mobx-restful';
import {
    TableCellLink,
    TableCellLocation,
    TableCellRelation,
    TableCellText
} from './type';

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

export const normalizeTextArray = (list: TableCellText[]) =>
    list.reduce(
        (sum, item) => {
            if (item.text === ',') sum.push('');
            else sum[sum.length - 1] += normalizeText(item);

            return sum;
        },
        ['']
    );
export function coordinateOf(location: TableCellLocation): [number, number] {
    const [longitude, latitude] =
        (location as TableCellLocation)?.location.split(',') || [];

    return [+latitude, +longitude];
}
