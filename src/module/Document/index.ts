import { HTTPError } from 'koajax';
import { BaseListModel } from 'mobx-restful';
import { cache, formatDate, uniqueID } from 'web-utility';

import { isLarkError, LarkData } from '../../type';
import { createPageStream } from '../base';
import { TaskModel } from '../Task';
import { User } from '../User/type';
import { WikiNode, WikiNodeModel } from '../Wiki';
import {
    BiTableBlock,
    Block,
    BlockType,
    Document,
    FileBlock,
    IframeBlock,
    IframeComponentType,
    ImageBlock,
    OrderedBlock,
    QuoteContainerBlock,
    SheetBlock,
    SubPageList,
    TaskBlock,
    TextBlock,
    TextElement,
    TextRun,
    WikiCatalog
} from './type';

export * from './type';
export * from './component';

export type FileURLResolver = (token: string) => string | Promise<string>;

export abstract class DocumentModel extends BaseListModel<Document> {
    baseURI = 'docx/v1/documents';

    constructor(public domain: string) {
        super();
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
    #getOneUser = cache(async (clean, user_id: string) => {
        const { body } = await this.client.get<LarkData<{ user: User }>>(
            `contact/v3/users/${user_id}`
        );
        return body!.data!.user;
    }, 'DocumentModel.#getOneUser');

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
    async getOneBlocks(id: string, resolveFileURL?: FileURLResolver) {
        const stream = createPageStream<Block<any, any, any>>(
            this.client,
            `docx/v1/documents/${id}/blocks`,
            total => void total
        );
        return Array.fromAsync(this.#resolveBlocks(stream, resolveFileURL));
    }
}
