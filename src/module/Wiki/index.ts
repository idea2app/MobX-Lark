import { ListModel, Stream, toggle } from 'mobx-restful';

import { LarkData } from '../../type';
import { createPageStream } from '../base';
import { LarkWiki, LarkWikiNode } from './type';

export * from './type';

export abstract class WikiModel extends Stream<LarkWiki>(ListModel) {
    baseURI = `wiki/v2/spaces`;

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/list}
     */
    async *openStream() {
        for await (const item of createPageStream<LarkWiki>(
            this.client,
            this.baseURI,
            total => (this.totalCount = total),
            { page_size: 50 }
        ))
            yield item;
    }
}

export abstract class WikiNodeModel extends Stream<LarkWikiNode>(ListModel) {
    constructor(
        public domain: string,
        public wikiId: string
    ) {
        super();
        this.baseURI = `wiki/v2/spaces/${wikiId}/nodes`;
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/docs/wiki-v2/space-node/get_node}
     */
    @toggle('downloading')
    async getOne(id: string) {
        const { body } = await this.client.get<LarkData<{ node: LarkWikiNode }>>(
            `wiki/v2/spaces/get_node?token=${id}`
        );
        return body!.data!.node;
    }

    async *openStream() {
        yield* this.traverseTree(undefined, total => (this.totalCount = total));
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/docs/wiki-v2/space-node/list}
     */
    async *traverseTree(
        parent_node_token?: string,
        onCount?: (total: number) => any
    ): AsyncGenerator<LarkWikiNode> {
        let totalCount = 0;

        const addCount = (total: number) => (totalCount += total);

        const stream = createPageStream<LarkWikiNode>(this.client, this.baseURI, addCount, {
            page_size: 50,
            parent_node_token
        });

        for (const node of await Array.fromAsync(stream)) {
            yield node;

            if (node.has_child) yield* this.traverseTree(node.node_token, addCount);
        }
        onCount?.(totalCount);
    }
}
