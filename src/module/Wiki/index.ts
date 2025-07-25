import { ListModel, Stream } from 'mobx-restful';
import { buildURLData } from 'web-utility';

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
            total => (this.totalCount = total)
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
     * @see {@link https://open.feishu.cn/document/server-docs/docs/wiki-v2/space-node/list}
     */
    async *openStream() {
        for await (const item of createPageStream<LarkWikiNode>(
            this.client,
            this.baseURI,
            total => (this.totalCount = total)
        ))
            yield item;
    }

    async *traverseTree(
        parent_node_token?: string
    ): AsyncGenerator<LarkWikiNode> {
        const stream = createPageStream<LarkWikiNode>(
            this.client,
            `${this.baseURI}?${buildURLData({
                page_size: 50,
                parent_node_token
            })}`,
            total => void total
        );
        for (const node of await Array.fromAsync(stream)) {
            yield node;

            if (node.has_child) yield* this.traverseTree(node.node_token);
        }
    }
}
