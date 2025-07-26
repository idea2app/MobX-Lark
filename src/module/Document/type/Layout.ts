import { Block } from './Block';
import { BackgroundColor, FontColor } from './Text';

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#4b4dbec6}
 */
export type DividerBlock = Block<'divider', {}>;

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#10591ec3}
 */
export type CalloutBlock = Block<
    'callout',
    {
        background_color?: BackgroundColor;
        border_color?: FontColor;
        text_color?: FontColor;
        /**
         * @todo
         * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/emoji}
         */
        emoji_id?: string;
    }
>;

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#d04c994f}
 */
export type GridBlock = Block<'grid', { column_size: number }>;

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#3134f01b}
 */
export type GridColumnBlock = Block<'grid_column', { width_ratio: number }>;

export type TableMergeInfo = Partial<Record<'row_span' | 'col_span', number>>;

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#28f31481}
 */
export type TableBlock = Block<
    'table',
    {
        cells?: string[];
        property: {
            row_size: number;
            column_size: number;
            column_width?: number[];
            header_row?: boolean;
            header_column?: boolean;
            merge_info?: TableMergeInfo[];
        };
    }
>;

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#eca5d2c3}
 */
export type TableCellBlock = Block<'table_cell', {}>;
