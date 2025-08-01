import { Block, BlockType } from './Block';
import { Align } from './Text';

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#224f293c}
 */
export type LinkPreviewURLType = 'MessageLink' | 'Undefined';

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#7680e63}
 */
export type LinkPreviewBlock = Block<
    BlockType.link_preview,
    'link_preview',
    { url: string; url_type: LinkPreviewURLType }
>;

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#f7b07e0c}
 */
export enum IframeComponentType {
    Bilibili = 1,
    XiguaVideo = 2,
    Youku = 3,
    Airtable = 4,
    BaiduMap = 5,
    GaodeMap = 6,
    Undefined = 7,
    Figma = 8,
    MoDao = 9,
    Canva = 10,
    CodePen = 11,
    FeiShuSurvey = 12,
    JinShuJu = 13,
    Undefined1 = 14,
    Undefined2 = 15
}

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#1613ffc1}
 */
export type IframeBlock = Block<
    BlockType.iframe,
    'iframe',
    { component: { type: IframeComponentType; url: string } }
>;

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#a6f35866}
 */
export type ImageBlock = Block<
    BlockType.image,
    'image',
    {
        token?: string;
        /**
         * Developer customized URL
         */
        url?: string;
        width?: number;
        height?: number;
        align?: Align;
        caption?: { content?: string };
    }
>;

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#2296d870}
 */
export enum ViewType {
    /**
     * 卡片视图，独占一行的一种视图，在 Card 上可有一些简单交互
     */
    Card = 1,
    /**
     * 预览视图，在当前页面直接预览插入的 Block 内容，而不需要打开新的页面
     */
    Preview = 2,
    /**
     * 内联视图
     */
    Inline = 3
}

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#a1b455e8}
 */
export type ViewBlock = Block<BlockType.view, 'view', { view_type?: ViewType }>;

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#2b183663}
 */
export type FileBlock = Block<
    BlockType.file,
    'file',
    { token?: string; name?: string; view_type?: ViewType }
>;
