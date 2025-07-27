import { FC, TdHTMLAttributes } from 'react';
import { splitArray } from 'web-utility';

import {
    CalloutBlock,
    DividerBlock,
    GridBlock,
    GridColumnBlock,
    TableBlock,
    TableCellBlock,
    TextBlock
} from '../type';
import { BackgroundColorMap, TextColorMap } from './constant';
import { TextBlockComponent } from './Text';

export const DividerBlockComponent: FC<DividerBlock> = () => <hr />;

export const CalloutBlockComponent: FC<CalloutBlock<TextBlock>> = ({ callout, children }) => (
    <blockquote
        style={{
            border: callout.border_color && `1px solid ${TextColorMap[callout.border_color]}`,
            backgroundColor:
                callout.background_color && BackgroundColorMap[callout.background_color],
            color: callout.text_color && TextColorMap[callout.text_color]
        }}
    >
        {children?.map(child => (
            <TextBlockComponent key={child.block_id} {...child} />
        ))}
    </blockquote>
);

export const GridBlockComponent: FC<GridBlock<GridColumnBlock<TextBlock>>> = ({ children }) => (
    <div className="lark-grid-block">
        {children?.map(child => (
            <GridColumnBlockComponent key={child.block_id} {...child} />
        ))}
    </div>
);

export const GridColumnBlockComponent: FC<GridColumnBlock<TextBlock>> = ({
    grid_column,
    children
}) => (
    <div className="lark-grid-column-block" style={{ width: `${grid_column.width_ratio}%` }}>
        {children?.map(child => (
            <TextBlockComponent key={child.block_id} {...child} />
        ))}
    </div>
);

export const TableBlockComponent: FC<TableBlock<TableCellBlock<TextBlock>>> = ({
    table,
    children
}) => {
    const { header_row, header_column, column_size, column_width, merge_info } = table.property;

    const [header, ...body] = splitArray(children || [], column_size),
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
                                    width={rowWidth[columnIndex]}
                                    rowSpan={rowMerge[columnIndex]?.row_span}
                                    colSpan={rowMerge[columnIndex]?.col_span}
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
        TableCellBlock<TextBlock> {
    is?: 'th' | 'td';
}

export const TableCellBlockComponent: FC<TableCellBlockComponentProps> = ({
    is: Tag = 'td',
    children,
    ...props
}) => (
    <Tag {...props}>
        {children?.map(child => (
            <TextBlockComponent key={child.block_id} {...child} />
        ))}
    </Tag>
);
