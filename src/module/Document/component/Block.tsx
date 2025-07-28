import { FC } from 'react';

import { Block, BlockType, FileBlock, ImageBlock, TextBlock } from '../type';
import { TextBlockComponent } from './Text';
import {
    CalloutBlockComponent,
    DividerBlockComponent,
    GridBlockComponent,
    GridColumnBlockComponent,
    TableBlockComponent,
    TableCellBlockComponent
} from './Layout';
import { FileBlockComponent, IframeBlockComponent, ImageBlockComponent } from './Media';

export const blockComponentMap: Partial<Record<BlockType, FC<any>>> = {
    [BlockType.page]: TextBlockComponent,
    [BlockType.text]: TextBlockComponent,
    [BlockType.heading1]: TextBlockComponent,
    [BlockType.heading2]: TextBlockComponent,
    [BlockType.heading3]: TextBlockComponent,
    [BlockType.heading4]: TextBlockComponent,
    [BlockType.heading5]: TextBlockComponent,
    [BlockType.heading6]: TextBlockComponent,
    [BlockType.heading7]: TextBlockComponent,
    [BlockType.heading8]: TextBlockComponent,
    [BlockType.heading9]: TextBlockComponent,
    [BlockType.bullet]: TextBlockComponent,
    [BlockType.ordered]: TextBlockComponent,
    [BlockType.code]: TextBlockComponent,
    [BlockType.quote]: TextBlockComponent,
    [BlockType.todo]: TextBlockComponent,
    [BlockType.divider]: DividerBlockComponent,
    [BlockType.callout]: CalloutBlockComponent,
    [BlockType.grid]: GridBlockComponent,
    [BlockType.grid_column]: GridColumnBlockComponent,
    [BlockType.table]: TableBlockComponent,
    [BlockType.table_cell]: TableCellBlockComponent,
    [BlockType.iframe]: IframeBlockComponent,
    [BlockType.image]: ImageBlockComponent,
    [BlockType.file]: FileBlockComponent,
};

export const blockMap: Record<string, Block<any, any, any>> = {};

export function registerBlocks<T extends Block<any, any, any>>(blocks: T[]) {
    let root: T | undefined,
        files: Partial<Record<'token' | 'name', string>>[] = [];

    for (const block of blocks) {
        blockMap[block.block_id] = block;

        if (!block.parent_id) root = block;
        else if (block.block_type === BlockType.text) {
            for (const { file, text_run } of (block as unknown as TextBlock).text.elements)
                if (file)
                    files.push({
                        token: file.file_token,
                        name: text_run?.content
                    });
        } else if (block.block_type === BlockType.file) {
            const { token, name } = (block as unknown as FileBlock).file;

            files.push({ token, name });
        } else if (block.block_type === BlockType.image) {
            const { token, caption } = (block as unknown as ImageBlock).image;

            files.push({ token, name: caption?.content });
        }
    }
    return { root, files };
}

export const ChildrenRenderer: FC<{ children?: string[] }> = ({ children }) => (
    <>
        {children?.map(block_id => {
            const block = blockMap[block_id];
            if (!block) return;

            const BlockComponent = blockComponentMap[block.block_type as BlockType];

            if (!BlockComponent) return <p>Unsupported Block Type {block.block_type}</p>;

            return <BlockComponent key={block.block_id} {...block} />;
        })}
    </>
);

export function renderBlocks(blocks: Block<any, any, any>[]) {
    const { root, files } = registerBlocks(blocks);

    if (!root) throw new ReferenceError('No root block to render');

    const vDOM = <ChildrenRenderer>{[root.block_id]}</ChildrenRenderer>;

    return { vDOM, files };
}
