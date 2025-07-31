import { BaseListModel } from 'mobx-restful';
import { cache } from 'web-utility';

import { LarkData } from '../../type';
import { createPageStream } from '../base';
import { User } from '../User/type';
import { Block, BlockType, Document, TextBlock, TextElement } from './type';

export * from './type';
export * from './component';

export abstract class DocumentModel extends BaseListModel<Document> {
    baseURI = 'docx/v1/documents';

    #getOneUser = cache(async (clean, user_id: string) => {
        const { body } = await this.client.get<LarkData<{ user: User }>>(
            `contact/v3/users/${user_id}`
        );
        return body!.data!.user;
    }, 'DocumentModel.#getOneUser');

    #getOneDocument = cache(
        (clean, token: string) => this.getOne(token),
        'DocumentModel.#getOneDocument'
    );

    async *#resolveTextElements(elements: TextBlock['text']['elements']) {
        for (const element of elements) {
            const { mention_user, mention_doc } = element;

            if (mention_user) {
                const { user_id, text_element_style } = mention_user;
                try {
                    const { name } = await this.#getOneUser(user_id);

                    yield { text_run: { content: `@${name}`, text_element_style } } as TextElement;
                } catch (error) {
                    console.error(error);

                    yield element;
                }
            } else if (mention_doc) {
                const { token, url, text_element_style } = mention_doc;
                try {
                    const { title } = await this.#getOneDocument(token);

                    yield {
                        text_run: {
                            content: title,
                            text_element_style: { ...text_element_style, link: { url } }
                        }
                    } as TextElement;
                } catch (error) {
                    console.error(error);

                    yield element;
                }
            } else yield element;
        }
    }

    async *#resolveBlocks(stream: AsyncIterable<Block<any, any, any>>) {
        for await (const block of stream) {
            switch (block.block_type) {
                case BlockType.text: {
                    const { text } = block as TextBlock;

                    text.elements = await Array.fromAsync(this.#resolveTextElements(text.elements));
                    break;
                }
            }
            yield block;
        }
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document/list}
     */
    async getOneBlocks(id: string) {
        const stream = createPageStream<Block<any, any, any>>(
            this.client,
            `docx/v1/documents/${id}/blocks`,
            total => void total
        );
        return Array.fromAsync(this.#resolveBlocks(stream));
    }
}
