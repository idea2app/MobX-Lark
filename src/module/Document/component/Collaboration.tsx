import { FC } from 'react';

import {
    AgendaBlock,
    AgendaItemBlock,
    AgendaItemContentBlock,
    AgendaItemTitleBlock,
    BlockType
} from '../type';
import { ChildrenRenderer } from './Block';
import { TextBlockComponent } from './Text';

export const AgendaBlockComponent: FC<AgendaBlock> = ({ children }) => (
    <ChildrenRenderer>{children}</ChildrenRenderer>
);

export const AgendaItemBlockComponent: FC<AgendaItemBlock> = ({ children }) => (
    <details open>
        <ChildrenRenderer>{children}</ChildrenRenderer>
    </details>
);

export const AgendaItemTitleBlockComponent: FC<AgendaItemTitleBlock> = ({
    agenda_item_title: { elements, align },
    ...props
}) => (
    <summary>
        <TextBlockComponent
            {...props}
            block_type={BlockType.todo}
            todo={{ elements, style: { align } }}
        />
    </summary>
);

export const AgendaItemContentBlockComponent: FC<AgendaItemContentBlock> = ({ children }) => (
    <ChildrenRenderer>{children}</ChildrenRenderer>
);
