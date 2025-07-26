import { Block, BlockType } from './Block';

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#05e7d57e}
 */
export enum Align {
    left = 1,
    center = 2,
    right = 3
}

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#19b9b4bf}
 */
export type TextIndentationLevel = 'NoIndent' | 'OneLevelIndent';

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#be1b12a7}
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#fb1f28b8}
 */
export enum FontColor {
    Red = 1,
    Orange = 2,
    Yellow = 3,
    Green = 4,
    Blue = 5,
    Purple = 6,
    Gray = 7
}

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#45c9c07b}
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#28d02e32}
 */
export enum BackgroundColor {
    /**
     * 浅红色
     */
    LightRedBackground = 1,
    /**
     * 浅橙色
     */
    LightOrangeBackground = 2,
    /**
     * 浅黄色
     */
    LightYellowBackground = 3,
    /**
     * 浅绿色
     */
    LightGreenBackground = 4,
    /**
     * 浅蓝色
     */
    LightBlueBackground = 5,
    /**
     * 浅紫色
     */
    LightPurpleBackground = 6,
    /**
     * 中灰色
     */
    PaleGrayBackground = 7,
    /**
     * 红色
     */
    DarkRedBackground = 8,
    /**
     * 橙色
     */
    DarkOrangeBackground = 9,
    /**
     * 黄色
     */
    DarkYellowBackground = 10,
    /**
     * 绿色
     */
    DarkGreenBackground = 11,
    /**
     * 蓝色
     */
    DarkBlueBackground = 12,
    /**
     * 紫色
     */
    DarkPurpleBackground = 13,
    /**
     * 灰色
     */
    DarkGrayBackground = 14,
    /**
     * 浅灰色
     */
    LightGrayBackground = 15
}

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#80293bd9}
 */
export type TextBackgroundColor = keyof typeof BackgroundColor;

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#45accc42}
 */
export enum CodeLanguage {
    PlainText = 1,
    ABAP = 2,
    Ada = 3,
    Apache = 4,
    Apex = 5,
    Assembly = 6,
    Bash = 7,
    CSharp = 8,
    CPlusPlus = 9,
    C = 10,
    COBOL = 11,
    CSS = 12,
    CoffeeScript = 13,
    D = 14,
    Dart = 15,
    Delphi = 16,
    Django = 17,
    Dockerfile = 18,
    Erlang = 19,
    Fortran = 20,
    FoxPro = 21,
    Go = 22,
    Groovy = 23,
    HTML = 24,
    HTMLBars = 25,
    HTTP = 26,
    Haskell = 27,
    JSON = 28,
    Java = 29,
    JavaScript = 30,
    Julia = 31,
    Kotlin = 32,
    LateX = 33,
    Lisp = 34,
    Logo = 35,
    Lua = 36,
    MATLAB = 37,
    Makefile = 38,
    Markdown = 39,
    Nginx = 40,
    Objective = 41,
    OpenEdgeABL = 42,
    PHP = 43,
    Perl = 44,
    PostScript = 45,
    PowerShell = 46,
    Prolog = 47,
    ProtoBuf = 48,
    Python = 49,
    R = 50,
    RPG = 51,
    Ruby = 52,
    Rust = 53,
    SAS = 54,
    SCSS = 55,
    SQL = 56,
    Scala = 57,
    Scheme = 58,
    Scratch = 59,
    Shell = 60,
    Swift = 61,
    Thrift = 62,
    TypeScript = 63,
    VBScript = 64,
    Visual = 65,
    XML = 66,
    YAML = 67,
    CMake = 68,
    Diff = 69,
    Gherkin = 70,
    GraphQL = 71,
    OpenGL_Shading_Language = 72,
    Properties = 73,
    Solidity = 74,
    TOML = 75
}

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#1c6877f3}
 */
export interface TextStyle extends Partial<Record<'done' | 'folded' | 'wrap', boolean>> {
    align?: Align;
    language?: CodeLanguage;
    background_color?: TextBackgroundColor;
    indentation_level?: TextIndentationLevel;
    sequence?: string;
}

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#669a5f7b}
 */
export interface TextElementStyle
    extends Partial<
        Record<'bold' | 'italic' | 'strikethrough' | 'underline' | 'inline_code', boolean>
    > {
    text_color?: FontColor;
    background_color?: BackgroundColor;
    link?: { url: string };
    comment_ids?: string[];
}

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#23769256}
 */
export interface TextElementData {
    text_element_style?: TextElementStyle;
}

export interface TextRun extends TextElementData {
    content: string;
}

export interface MentionUser extends TextElementData {
    user_id: string;
}

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#90567af6}
 */
export enum MentionObjType {
    Doc = 1,
    Sheet = 3,
    Bitable = 8,
    MindNote = 11,
    File = 12,
    Slide = 15,
    Wiki = 16,
    Docx = 22
}

export interface MentionDoc extends TextElementData {
    token: string;
    obj_type: MentionObjType;
    url: string;
}

export interface Reminder extends TextElementData {
    create_user_id: string;
    is_notify?: boolean;
    is_whole_day?: boolean;
    expire_time: number;
    notify_time: number;
}

export interface InlineFile extends TextElementData {
    file_token?: string;
    source_block_id?: string;
}

export interface InlineBlock extends TextElementData {
    block_id?: string;
}

export type Equation = TextRun;

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#68268d96}
 */
export interface TextElement {
    text_run?: TextRun;
    mention_user?: MentionUser;
    mention_doc?: MentionDoc;
    reminder?: Reminder;
    file?: InlineFile;
    inline_block?: InlineBlock;
    equation?: Equation;
    undefined_element?: {};
}

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#c1ebd2a2}
 */
export type TextBlock<Type extends BlockType = BlockType.text> = Block<
    Type,
    'text',
    { elements: TextElement[]; style?: TextStyle }
>;
export type PageBlock = TextBlock<BlockType.page>;
export type Heading1Block = TextBlock<BlockType.heading1>;
export type Heading2Block = TextBlock<BlockType.heading2>;
export type Heading3Block = TextBlock<BlockType.heading3>;
export type Heading4Block = TextBlock<BlockType.heading4>;
export type Heading5Block = TextBlock<BlockType.heading5>;
export type Heading6Block = TextBlock<BlockType.heading6>;
export type Heading7Block = TextBlock<BlockType.heading7>;
export type Heading8Block = TextBlock<BlockType.heading8>;
export type Heading9Block = TextBlock<BlockType.heading9>;
export type BulletBlock = TextBlock<BlockType.bullet>;
export type OrderedBlock = TextBlock<BlockType.ordered>;
export type CodeBlock = TextBlock<BlockType.code>;
export type QuoteBlock = TextBlock<BlockType.quote>;
export type TodoBlock = TextBlock<BlockType.todo>;
