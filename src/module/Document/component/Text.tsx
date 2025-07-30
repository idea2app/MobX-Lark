import { Fragment, FC, CSSProperties } from 'react';

import {
    Align,
    BackgroundColor,
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
    TextStyle,
    TextRun,
    TodoBlock
} from '../type';
import { ChildrenRenderer } from './Block';
import { TextColorMap, BackgroundColorMap, TextTagMap } from './constant';

export const styleOf = ({
    indentation_level,
    align,
    background_color
}: TextStyle): CSSProperties => ({
    textIndent: indentation_level === 'OneLevelIndent' ? '1rem' : 0,
    textAlign: align === Align.right ? 'right' : align === Align.center ? 'center' : 'left',
    backgroundColor: background_color && BackgroundColorMap[BackgroundColor[background_color]]
});

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

    return block_type === BlockType.page ? (
        <Tag style={style && styleOf(style)}>
            <h1>
                <StyleTag>{texts}</StyleTag>
            </h1>
            <ChildrenRenderer>{children}</ChildrenRenderer>
        </Tag>
    ) : (
        <>
            <Tag
                className={style?.language ? `language-${style.language}` : ''}
                style={style && styleOf(style)}
            >
                {style?.language ? <code>{texts}</code> : <StyleTag>{texts}</StyleTag>}
            </Tag>

            <ChildrenRenderer>{children}</ChildrenRenderer>
        </>
    );
};

export const ListBlockComponent: FC<BulletBlock | OrderedBlock> = ({ block_type, ...props }) => {
    const Tag = block_type === BlockType.bullet ? 'ul' : 'ol',
        { style, elements } = 'bullet' in props ? props.bullet : props.ordered;

    return (
        <Tag style={style && styleOf(style)}>
            {elements.map(({ text_run }) => (
                <li key={text_run!.content}>
                    <TextRunComponent {...text_run!} />
                </li>
            ))}
        </Tag>
    );
};
