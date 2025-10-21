import { Filter, ListModel, Stream, toggle } from 'mobx-restful';
import { buildURLData } from 'web-utility';

import { LarkData } from '../../type';
import { createPageStream } from '../base';
import { Wiki, WikiNode, WikiTask } from './type';

export * from './type';

export abstract class WikiModel extends Stream<Wiki>(ListModel) {
    baseURI = `wiki/v2/spaces`;

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/list}
     */
    openStream() {
        return createPageStream<Wiki>(
            this.client,
            this.baseURI,
            total => (this.totalCount = total),
            { page_size: 50 }
        );
    }
}

export abstract class WikiNodeModel extends Stream<WikiNode>(ListModel) {
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
        const { body } = await this.client.get<LarkData<{ node: WikiNode }>>(
            `wiki/v2/spaces/get_node?token=${id}`
        );
        return body!.data!.node;
    }

    async *openStream({ parent_node_token }: Filter<WikiNode>) {
        const setCount = (total: number) => (this.totalCount = total);

        yield* parent_node_token
            ? this.traverseChildren(parent_node_token, setCount)
            : this.traverseTree(undefined, setCount);
    }

    traverseChildren(parent_node_token?: string, onCount: (total: number) => any = () => {}) {
        return createPageStream<WikiNode>(this.client, this.baseURI, onCount, {
            page_size: 50,
            parent_node_token
        });
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/docs/wiki-v2/space-node/list}
     */
    async *traverseTree(
        parentNode?: WikiNode,
        onCount?: (total: number) => any
    ): AsyncGenerator<WikiNode> {
        let totalCount = 0;

        const addCount = (total: number) => (totalCount += total);

        const stream = this.traverseChildren(parentNode?.node_token, addCount);

        for await (const node of stream) {
            const title = node.title.replace(/[\\/:*?"<>|]+/g, '-').trim();

            node.title_path = parentNode ? `${parentNode.title_path}/${title}` : title;

            yield node;

            if (node.has_child) yield* this.traverseTree(node, addCount);
        }
        onCount?.(totalCount);
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/docs/wiki-v2/task/move_docs_to_wiki}
     */
    @toggle('uploading')
    async moveDocument(
        document: Pick<WikiNode, 'obj_type' | 'obj_token'>,
        parent_wiki_token = '',
        apply = true
    ) {
        type WikiTaskMeta = { wiki_token: string } | { task_id: string } | { applied: boolean };

        const { body } = await this.client.post<LarkData<WikiTaskMeta>>(
            `${this.baseURI}/move_docs_to_wiki`,
            { ...document, parent_wiki_token, apply }
        );
        if ('applied' in body!.data!) return;

        if ('wiki_token' in body!.data!) return this.getOne(body!.data!.wiki_token);

        const { move_result } = await this.getOneTask(body!.data!.task_id);

        const [{ status, status_msg, node }] = move_result;

        if (status < 0) throw new URIError(status_msg);

        return node;
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/docs/wiki-v2/task/get}
     */
    @toggle('downloading')
    async getOneTask(taskId: string, task_type = 'move') {
        const { body } = await this.client.get<LarkData<{ task: WikiTask }>>(
            `wiki/v2/tasks/${taskId}?${buildURLData({ task_type })}`
        );
        return body!.data!.task;
    }
}
