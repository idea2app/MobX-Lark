import { Fragment, FC } from 'react';

import {
    Align,
    BlockType,
    BulletBlock,
    CodeBlock,
    Heading1Block,
    Heading2Block,
    Heading3Block,
    Heading4Block,
    Heading5Block,
    Heading6Block,
    Heading7Block,
    Heading8Block,
    Heading9Block,
    OrderedBlock,
    PageBlock,
    QuoteBlock,
    TextBlock,
    TextRun,
    TodoBlock
} from '../type';
import { ChildrenRenderer } from './Block';
import { TextColorMap, BackgroundColorMap, TextTagMap } from './constant';

export const TextRunComponent: FC<TextRun> = ({ content, text_element_style }) => {
    const {
        bold,
        italic,
        strikethrough,
        underline,
        inline_code,
        link,
        text_color,
        background_color
    } = text_element_style || {};

    const Tag = bold
        ? 'b'
        : italic
          ? 'i'
          : strikethrough
            ? 's'
            : underline
              ? 'u'
              : inline_code
                ? 'code'
                : link
                  ? 'a'
                  : 'span';
    return (
        <Tag
            style={{
                color: text_color && TextColorMap[text_color],
                backgroundColor: background_color && BackgroundColorMap[background_color]
            }}
            href={link?.url}
        >
            {content}
        </Tag>
    );
};

export type TextBlockComponentProps =
    | PageBlock
    | TextBlock
    | Heading1Block
    | Heading2Block
    | Heading3Block
    | Heading4Block
    | Heading5Block
    | Heading6Block
    | Heading7Block
    | Heading8Block
    | Heading9Block
    | BulletBlock
    | OrderedBlock
    | CodeBlock
    | QuoteBlock
    | TodoBlock;

export const TextBlockComponent: FC<TextBlockComponentProps> = ({
    block_type,
    children,
    ...props
}) => {
    const metaKey = Object.keys(BlockType).find(
        key => BlockType[key as keyof typeof BlockType] === block_type
    );
    const { elements, style } = props[metaKey as keyof typeof props] as object as TextBlock['text'];

    const Tag = TextTagMap[block_type] || Fragment,
        StyleTag = style?.done ? 's' : Fragment;

    const texts = elements.map(
        ({ text_run, mention_user, mention_doc, reminder, file, equation }) =>
            text_run ? (
                <TextRunComponent key={text_run.content} {...text_run} />
            ) : mention_user ? (
                <TextRunComponent
                    key={mention_user.user_id}
                    content={`👤${mention_user.user_id}`}
                    {...mention_user}
                />
            ) : mention_doc ? (
                <TextRunComponent
                    key={mention_doc.url}
                    content={mention_doc.url}
                    text_element_style={{ link: { url: mention_doc.url } }}
                />
            ) : reminder ? (
                <time key={reminder.expire_time} dateTime={new Date(reminder.expire_time).toJSON()}>
                    <TextRunComponent
                        content={new Date(reminder.expire_time).toJSON()}
                        {...reminder}
                    />
                </time>
            ) : file ? (
                <TextRunComponent
                    key={file.file_token}
                    content={`drive/v1/medias/${file.file_token}/download`}
                    text_element_style={{
                        link: { url: `drive/v1/medias/${file.file_token}/download` }
                    }}
                />
            ) : equation ? (
                // @todo KaTeX rendering
                <TextRunComponent key={equation.content} {...equation} />
            ) : null
    );

    return (
        <>
            <Tag
                className={style?.language ? `language-${style.language}` : ''}
                style={{
                    textIndent: style?.indentation_level === 'OneLevelIndent' ? '1rem' : 0,
                    textAlign:
                        style?.align === Align.left
                            ? 'left'
                            : style?.align === Align.center
                              ? 'center'
                              : 'right',
                    backgroundColor: style?.background_color
                }}
            >
                <StyleTag>{texts}</StyleTag>
            </Tag>

            <ChildrenRenderer>{children}</ChildrenRenderer>
        </>
    );
};
