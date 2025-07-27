import { Fragment, FC, JSX } from 'react';

import { Align, BlockType, TextBlock, TextRun } from '../type';
import { TextColorMap, BackgroundColorMap } from './constant';

export const TextTagMap: Partial<Record<BlockType, keyof JSX.IntrinsicElements>> = {
    [BlockType.page]: 'article',
    [BlockType.text]: 'p',
    [BlockType.heading1]: 'h1',
    [BlockType.heading2]: 'h2',
    [BlockType.heading3]: 'h3',
    [BlockType.heading4]: 'h4',
    [BlockType.heading5]: 'h5',
    [BlockType.heading6]: 'h6',
    [BlockType.bullet]: 'ul',
    [BlockType.ordered]: 'ol',
    [BlockType.code]: 'pre',
    [BlockType.quote]: 'blockquote',
    [BlockType.todo]: 'div'
};

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

export const TextBlockComponent: FC<TextBlock> = ({ block_type, text: { style, elements } }) => {
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
                    content={`📄${file.file_token}`}
                    {...file}
                />
            ) : equation ? (
                // @todo KaTeX rendering
                <TextRunComponent key={equation.content} {...equation} />
            ) : null
    );

    return (
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
    );
};
