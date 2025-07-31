import { FC } from 'react';
import { uniqueID } from 'web-utility';

import { Block, BlockType, FileBlock, ImageBlock, TextBlock } from '../type';
import { ListBlockComponent, TextBlockComponent } from './Text';
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
    [BlockType.bullet]: ListBlockComponent,
    [BlockType.ordered]: ListBlockComponent,
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
    [BlockType.file]: FileBlockComponent
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
    for (const parent of blocks) {
        parent.children ||= [];

        let virtualList: Block<any, any, any> | undefined;

        for (const childId of [...parent.children]) {
            const child = blockMap[childId];

            if (!child) continue;

            if (child.block_type === BlockType.bullet || child.block_type === BlockType.ordered) {
                const { block_type, block_id } = child;
                const index = parent.children.indexOf(block_id);

                if (virtualList?.block_type !== block_type) virtualList = undefined;

                const listKey = list2text(child) as string;

                if (!virtualList) {
                    virtualList = {
                        parent_id: parent.block_id,
                        block_type,
                        block_id: uniqueID(),
                        [listKey]: { elements: [] },
                        children: [block_id]
                    };
                    parent.children[index] = child.parent_id = virtualList.block_id;

                    blockMap[virtualList.block_id] = virtualList;
                } else {
                    virtualList.children!.push(block_id);

                    child.parent_id = virtualList.block_id;

                    parent.children.splice(index, 1);
                }
            } else virtualList = undefined;
        }
    }
    return { root, files };
}

function list2text<T extends Block<any, any, any>>(current: T) {
    const { block_type } = current;
    const listKey =
        block_type === BlockType.bullet
            ? 'bullet'
            : block_type === BlockType.ordered
              ? 'ordered'
              : undefined;
    if (listKey) {
        current.block_type = BlockType.text;
        current['text' as keyof T] = current[listKey];
        delete current[listKey];
    }
    return listKey;
}

export const ChildrenRenderer: FC<{ children?: string[] }> = ({ children }) => (
    <>
        {children
            ?.map(block_id => blockMap[block_id])
            .filter(Boolean)
            .map(block => {
                const { block_type, block_id } = block;

                const BlockComponent = blockComponentMap[block_type as BlockType];

                return BlockComponent ? (
                    <BlockComponent key={block_id} {...block} />
                ) : (
                    <p key={block_id}>Unsupported Block Type {block_type}</p>
                );
            })}
    </>
);

export function renderBlocks(blocks: Block<any, any, any>[]) {
    const { root, files } = registerBlocks(blocks);

    if (!root) throw new ReferenceError('No root block to render');

    const vDOM = <ChildrenRenderer>{[root.block_id]}</ChildrenRenderer>;

    return { vDOM, files };
}
