import { Block, BlockType } from './Block';
import { Align, TextElement } from './Text';

export type TaskBlock = Block<BlockType.task, 'task', { task_id: string }>;

export type AgendaBlock = Block<BlockType.agenda, 'agenda', {}>;

export type AgendaItemBlock = Block<BlockType.agenda_item, 'agenda_item', {}>;

export type AgendaItemTitleBlock = Block<
    BlockType.agenda_item_title,
    'agenda_item_title',
    { align?: Align; elements: TextElement[] }
>;

export type AgendaItemContentBlock = Block<
    BlockType.agenda_item_content,
    'agenda_item_content',
    {}
>;
