import { Fragment, FC, JSX, CSSProperties } from 'react';

import { Align, BackgroundColor, BlockType, FontColor, TextBlock, TextRun } from '../type';

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

export const TextColorMap: Record<FontColor, CSSProperties['color']> = {
    [FontColor.Red]: 'red',
    [FontColor.Orange]: 'orange',
    [FontColor.Yellow]: 'yellow',
    [FontColor.Green]: 'green',
    [FontColor.Blue]: 'blue',
    [FontColor.Purple]: 'purple',
    [FontColor.Gray]: 'gray'
};

export const BackgroundColorMap: Record<BackgroundColor, CSSProperties['backgroundColor']> = {
    [BackgroundColor.LightRedBackground]: '#ffcccc',
    [BackgroundColor.LightOrangeBackground]: '#ffe6cc',
    [BackgroundColor.LightYellowBackground]: '#ffffcc',
    [BackgroundColor.LightGreenBackground]: '#e6ffe6',
    [BackgroundColor.LightBlueBackground]: '#cceeff',
    [BackgroundColor.LightPurpleBackground]: '#f2e6ff',
    [BackgroundColor.PaleGrayBackground]: '#f2f2f2',
    [BackgroundColor.DarkRedBackground]: 'red',
    [BackgroundColor.DarkOrangeBackground]: 'orange',
    [BackgroundColor.DarkYellowBackground]: 'yellow',
    [BackgroundColor.DarkGreenBackground]: 'green',
    [BackgroundColor.DarkBlueBackground]: 'blue',
    [BackgroundColor.DarkPurpleBackground]: 'purple',
    [BackgroundColor.DarkGrayBackground]: 'gray',
    [BackgroundColor.LightGrayBackground]: 'lightgray'
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

    const texts = elements.map(({ text_run }) =>
        text_run ? <TextRunComponent key={text_run.content} {...text_run} /> : null
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
