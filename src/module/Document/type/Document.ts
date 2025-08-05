import { Block, BlockType } from './Block';

export type SheetBlock = Block<
    BlockType.sheet,
    'sheet',
    { token: string; row_size: number; column_size: number }
>;

export enum BiTableViewType {
    Grid = 1,
    Kanban = 2
}

export type BiTableBlock = Block<
    BlockType.bitable,
    'bitable',
    { token: string; view_type: BiTableViewType }
>;

export type WikiCatalog = Block<BlockType.wiki_catalog, 'wiki_catalog', { wiki_token: string }>;

export type SubPageList = Block<BlockType.sub_page_list, 'sub_page_list', { wiki_token: string }>;
