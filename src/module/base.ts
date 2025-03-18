import { DataObject, RESTClient } from 'mobx-restful';
import { buildURLData } from 'web-utility';

import { LarkPageData } from '../type';

export async function* createPageStream<T extends DataObject>(
    client: RESTClient,
    path: string,
    onCount: (total: number) => any,
    filter: DataObject = {}
) {
    var count = 0,
        lastPage = '';

    do {
        const { body } = await client.get<LarkPageData<T>>(
            `${path}?${buildURLData({
                ...filter,
                page_size: 500,
                page_token: lastPage
            })}`
        );
        var { items, total, has_more, page_token } = body!.data!;

        if (total != null) count = total;
        else count += items?.length || 0;

        lastPage = page_token;

        onCount(has_more ? Infinity : count);

        yield* items || [];
    } while (has_more);
}
