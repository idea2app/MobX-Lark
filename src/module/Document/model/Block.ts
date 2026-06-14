import { HTTPError } from 'koajax';
import memoize from 'lodash.memoize';
import { ListModel, Stream, toggle } from 'mobx-restful';
import { buildURLData, formatDate, uniqueID } from 'web-utility';

import { LarkData, isLarkError } from '../../../type';
import { createPageStream } from '../../base';
import { TaskModel } from '../../Task';
import { User, UserIdType } from '../../User/type';
import { WikiNode, WikiNodeModel } from '../../Wiki';
import { FileURLResolver } from '../index';
import {
    BiTableBlock,
    Block,
    BlockType,
    DocumentBlockUpdateResult,
    FileBlock,
    IframeBlock,
    IframeComponentType,
    ImageBlock,
    OrderedBlock,
    PageBlock,
    QuoteContainerBlock,
    SheetBlock,
    SubPageList,
    TaskBlock,
    TextBlock,
    TextElement,
    TextRun,
    WikiCatalog
} from '../type';

export abstract class DocumentBlockModel extends Stream<Block<any, any, any>>(ListModel) {
    constructor(
        public domain: string,
        public documentId: string
    ) {
        super();
        this.baseURI = `docx/v1/documents/${documentId}/blocks`;
    }

    openStream() {
        return createPageStream<Block<any, any, any>>(
            this.client,
            this.baseURI,
            total => (this.totalCount = total)
        );
    }

    #createLinkElement = (
        url: string,
        content = url,
        text_element_style?: TextRun['text_element_style']
    ): TextElement => ({
        text_run: { content, text_element_style: { ...text_element_style, link: { url } } }
    });

    #createLinkBlock = (oldBlock: Block<any, any, any>, url: string, content = url): TextBlock => ({
        ...oldBlock,
        block_type: BlockType.text,
        text: { elements: [this.#createLinkElement(url, content)] }
    });

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/contact-v3/user/get}
     */
    #getOneUser = memoize(async (user_id: string) => {
        const { body } = await this.client.get<LarkData<{ user: User }>>(
            `contact/v3/users/${user_id}`
        );
        return body!.data!.user;
    });

    async *#resolveTextElements(
        elements: TextBlock['text']['elements'],
        resolveFileURL?: FileURLResolver
    ) {
        for (const element of elements)
            try {
                const { mention_user, file } = element;

                if (mention_user) {
                    const { user_id, text_element_style } = mention_user;

                    const { name, nickname, email, enterprise_email, mobile } =
                        await this.#getOneUser(user_id);
                    const Name = nickname || name,
                        Email = enterprise_email || email;

                    yield this.#createLinkElement(
                        Email ? `mailto:${Email}` : `tel:${mobile}`,
                        Name ? `@${Name}` : Email || mobile,
                        text_element_style
                    );
                } else if (file) {
                    const { file_token, text_element_style } = file;

                    const url = await resolveFileURL?.(file_token || '');

                    if (url) yield this.#createLinkElement(url, url, text_element_style);
                } else yield element;
            } catch (error) {
                if (error instanceof HTTPError && isLarkError(error.response.body))
                    console.error(error.response.body);
                else console.error(error);

                yield element;
            }
    }

    async #getWikiSubDocuments(token: string) {
        const { client } = this;

        class MyWikiNodeModel extends WikiNodeModel {
            client = client;
        }
        const { body } = await client.get<LarkData<{ node: WikiNode }>>(
            `wiki/v2/spaces/get_node?token=${token}`
        );
        const { space_id } = body!.data!.node;

        const wikiNodeStore = new MyWikiNodeModel(this.domain, space_id);

        return wikiNodeStore.getAll({ parent_node_token: token });
    }

    async *#resolveBlocks(
        stream: AsyncIterable<Block<any, any, any>>,
        resolveFileURL?: FileURLResolver
    ) {
        const { client } = this;

        class MyTaskModel extends TaskModel {
            client = client;
        }
        const taskStore = new MyTaskModel();

        for await (let block of stream) {
            if (block.block_type === BlockType.text) {
                const { text } = block as TextBlock;

                text.elements = await Array.fromAsync(this.#resolveTextElements(text.elements));
            } else if (block.block_type === BlockType.file) {
                const { file, ...meta } = block as FileBlock;
                const url = resolveFileURL?.(file.token || '');

                if (url) {
                    yield {
                        ...meta,
                        block_type: BlockType.iframe,
                        iframe: { component: { url, type: IframeComponentType.Undefined } }
                    } as IframeBlock;

                    continue;
                }
            } else if (block.block_type === BlockType.image) {
                const { image } = block as ImageBlock;

                image.url = await resolveFileURL?.(image.token || '');
            } else if (block.block_type === BlockType.sheet) {
                const [token, sheet] = (block as SheetBlock).sheet.token.split('_');

                yield this.#createLinkBlock(
                    block,
                    `https://${this.domain}/sheets/${token}?sheet=${sheet}`
                );
                continue;
            } else if (block.block_type === BlockType.bitable) {
                const [token, table] = (block as BiTableBlock).bitable.token.split('_');

                yield this.#createLinkBlock(
                    block,
                    `https://${this.domain}/base/${token}?table=${table}`
                );
                continue;
            } else if (
                block.block_type === BlockType.wiki_catalog ||
                block.block_type === BlockType.sub_page_list
            ) {
                const parentBlock = {
                    ...block,
                    block_type: BlockType.quote_container,
                    quote_container: {},
                    children: []
                } as QuoteContainerBlock;

                yield parentBlock;

                const { wiki_token } =
                    'wiki_catalog' in block
                        ? (block as WikiCatalog).wiki_catalog
                        : (block as SubPageList).sub_page_list;

                for (const { title, node_token } of await this.#getWikiSubDocuments(wiki_token)) {
                    const text_run = {
                        content: title,
                        text_element_style: {
                            link: { url: `https://${this.domain}/wiki/${node_token}` }
                        }
                    } as TextRun;

                    const block_id = uniqueID();

                    yield {
                        parent_id: parentBlock.block_id,
                        block_id,
                        block_type: BlockType.ordered,
                        ordered: { elements: [{ text_run }] }
                    } as OrderedBlock;

                    parentBlock.children!.push(block_id);
                }
                continue;
            } else if (block.block_type === BlockType.task) {
                const { task_id } = (block as TaskBlock).task;

                const { url, summary, members, due, status } = await taskStore.getOne(task_id);
                const content = [
                    summary,
                    members.map(({ name }) => `@${name}`).join(' '),
                    due && formatDate(due.timestamp)
                ]
                    .filter(Boolean)
                    .join(' ');
                const newBlock = this.#createLinkBlock(block, url, content);

                newBlock.text.style = { done: status === 'done' };

                yield newBlock;
                continue;
            }
            yield block;
        }
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document/list}
     */
    @toggle('downloading')
    getRenderableAll(resolveFileURL?: FileURLResolver) {
        return Array.fromAsync<Block<any, any, any>>(this.#resolveBlocks(this, resolveFileURL));
    }

    /**
     * @see {@link https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert}
     */
    @toggle('downloading')
    async convertFrom(markUpDown: string, user_id_type: UserIdType = 'open_id') {
        type ConvertResult = {
            first_level_block_ids: string[];
            blocks: Block<any, any>[];
            block_id_to_image_urls: Record<'block_id' | 'image_url', string>[];
        };
        const { body } = await this.client.post<LarkData<ConvertResult>>(
            `docx/v1/documents/blocks/convert?${buildURLData({ user_id_type })}`,
            { content_type: 'markdown', content: markUpDown }
        );
        return body!.data!;
    }

    @toggle('downloading')
    async getRoot() {
        for await (const block of this)
            if (block.block_type === BlockType.page) return block as PageBlock;
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/batch_delete}
     */
    @toggle('uploading')
    async removeAll() {
        const rootBlock = await this.getRoot();

        if (rootBlock?.children?.[0])
            await this.client.delete<LarkData<DocumentBlockUpdateResult>>(
                `${this.baseURI}/${rootBlock.block_id}/children/batch_delete`,
                { start_index: 0, end_index: rootBlock.children.length }
            );
    }

    /**
     * @see {@link https://open.feishu.cn/document/docs/docs/document-block/create-2}
     */
    @toggle('uploading')
    async insert(
        markUpDown: string,
        index = -1,
        rootBlockId?: string,
        user_id_type: UserIdType = 'open_id'
    ) {
        const { first_level_block_ids: children_id, blocks } = await this.convertFrom(
            markUpDown,
            user_id_type
        );
        rootBlockId ||= (await this.getRoot())?.block_id;

        type DescendantResult = DocumentBlockUpdateResult & {
            children: Block<any, any, any>[];
            block_id_relations: Record<`${'temporary_' | ''}block_id`, string>[];
        };
        const { body } = await this.client.post<LarkData<DescendantResult>>(
            `${this.baseURI}/${rootBlockId}/descendant?${buildURLData({ user_id_type })}`,
            { index, children_id, descendants: blocks }
        );
        return body!.data!;
    }
}
