import { FC, TdHTMLAttributes } from 'react';
import { splitArray } from 'web-utility';

import {
    CalloutBlock,
    DividerBlock,
    GridBlock,
    GridColumnBlock,
    TableBlock,
    TableCellBlock
} from '../type';
import { blockMap, ChildrenRenderer } from './Block';
import { BackgroundColorMap, TextColorMap } from './constant';

export const DividerBlockComponent: FC<DividerBlock> = () => <hr />;

export const CalloutBlockComponent: FC<CalloutBlock> = ({ callout, children }) => (
    <blockquote
        style={{
            border: callout.border_color && `1px solid ${TextColorMap[callout.border_color]}`,
            backgroundColor:
                callout.background_color && BackgroundColorMap[callout.background_color],
            color: callout.text_color && TextColorMap[callout.text_color]
        }}
    >
        <ChildrenRenderer>{children}</ChildrenRenderer>
    </blockquote>
);

export const GridBlockComponent: FC<GridBlock> = ({ children }) => (
    <div className="lark-grid-block">
        <ChildrenRenderer>{children}</ChildrenRenderer>
    </div>
);

export const GridColumnBlockComponent: FC<GridColumnBlock> = ({ grid_column, children }) => (
    <div className="lark-grid-column-block" style={{ width: `${grid_column.width_ratio}%` }}>
        <ChildrenRenderer>{children}</ChildrenRenderer>
    </div>
);

export const TableBlockComponent: FC<TableBlock> = ({ table, children }) => {
    const { header_row, header_column, column_size, column_width, merge_info } = table.property;

    const blocks = (children || [])
        .map(block_id => blockMap[block_id])
        .filter(Boolean) as TableCellBlock[];

    const [header, ...body] = splitArray(blocks, column_size),
        [headerWidth, ...bodyWidth] = splitArray(column_width || [], column_size),
        [headerMerge, ...bodyMerge] = splitArray(merge_info || [], column_size);

    return (
        <table>
            {header_row && (
                <thead>
                    <tr>
                        {header.map((cell, index) => (
                            <TableCellBlockComponent
                                key={cell.block_id}
                                is="th"
                                width={headerWidth?.[index]}
                                rowSpan={headerMerge?.[index]?.row_span}
                                colSpan={headerMerge?.[index]?.col_span}
                                {...cell}
                            />
                        ))}
                    </tr>
                </thead>
            )}
            <tbody>
                {(header_row ? body : [header, ...body]).map((row, rowIndex) => {
                    const rowWidth = header_row
                            ? bodyWidth[rowIndex]
                            : [headerWidth, ...bodyWidth][rowIndex],
                        rowMerge = header_row
                            ? bodyMerge[rowIndex]
                            : [headerMerge, ...bodyMerge][rowIndex];

                    return (
                        <tr key={row[0].block_id}>
                            {row.map((cell, columnIndex) => (
                                <TableCellBlockComponent
                                    key={cell.block_id}
                                    is={!columnIndex && header_column ? 'th' : 'td'}
                                    width={rowWidth?.[columnIndex]}
                                    rowSpan={rowMerge?.[columnIndex]?.row_span}
                                    colSpan={rowMerge?.[columnIndex]?.col_span}
                                    {...cell}
                                />
                            ))}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export interface TableCellBlockComponentProps
    extends Pick<TdHTMLAttributes<HTMLTableCellElement>, 'width' | 'colSpan' | 'rowSpan'>,
        TableCellBlock {
    is?: 'th' | 'td';
}

export const TableCellBlockComponent: FC<TableCellBlockComponentProps> = ({
    is: Tag = 'td',
    children,
    ...props
}) => (
    <Tag {...props}>
        <ChildrenRenderer>{children}</ChildrenRenderer>
    </Tag>
);
