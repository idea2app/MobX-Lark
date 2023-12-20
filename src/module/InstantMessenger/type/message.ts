import { I18nKey } from '../../../type';

export interface TextMessage {
    text: string;
}

export interface TextTag extends TextMessage {
    tag: 'text';
    un_escape?: boolean;
}

export interface LinkTag extends TextMessage {
    tag: 'a';
    href: string;
}

export interface AtTag {
    tag: 'at';
    user_id: string;
    user_name?: string;
}

export interface ImageTag {
    tag: 'img';
    image_key: string;
    width?: number;
    height?: number;
}

export type RichTextTag = TextTag | LinkTag | AtTag | ImageTag;

export type RichTextMessage = {
    [key: I18nKey]: {
        title: string;
        content: RichTextTag[][];
    };
};

export interface UserCardMessage {
    type: 'share_user';
    user_id: string;
}

export interface ChatCardMessage {
    type: 'share_chat';
    chat_id: string;
}

export interface FileMessage<T extends string = 'file'> {
    type: T;
    file_key: string;
}

export type StickerMessage = FileMessage<'sticker'>;

export type AudioMessage = FileMessage<'audio'>;

export type VideoMessage = FileMessage<'media'> & Pick<ImageTag, 'image_key'>;

export interface TextCardTag {
    tag: 'plain_text' | 'lark_md';
    content?: string;
    i18n?: Record<I18nKey, string>;
    lines?: number;
}

export interface HrCardTag {
    tag: 'hr';
}

export type URLCardTag = Record<
    `${'' | 'pc_' | 'android_' | 'ios_'}url`,
    string
>;

export type ConfirmCardTag = Record<'title' | 'text', TextCardTag>;

export interface ButtonCardTag {
    tag: 'button';
    type?: 'default' | 'primary' | 'danger';
    text: TextCardTag;
    value?: Record<string, string>;
    url?: string;
    multi_url?: URLCardTag;
    confirm?: ConfirmCardTag;
}

export interface DivCardTag {
    tag: 'div';
    text?: TextCardTag;
    fields?: {
        is_short: boolean;
        text: TextCardTag;
    }[];
    extra?: ButtonCardTag;
}

export interface ActionCardTag {
    tag: 'action';
    layout: 'bisected';
    actions: ButtonCardTag[];
}

export type CardTag = HrCardTag | DivCardTag | ActionCardTag;

export type TemplateColor =
    | 'blue'
    | 'wathet'
    | 'turquoise'
    | 'green'
    | 'yellow'
    | 'orange'
    | 'red'
    | 'carmine'
    | 'violet'
    | 'purple'
    | 'indigo'
    | 'grey';

export interface CardHeader {
    title: TextCardTag;
    template?: TemplateColor;
}

export interface InteractiveMessage
    extends Partial<Record<`${'' | 'i18n_'}elements`, CardTag[]>> {
    config?: Partial<Record<'enable_forward' | 'update_multi', boolean>>;
    header?: CardHeader;
}

export type ChatMessageContent =
    | TextMessage
    | RichTextMessage
    | UserCardMessage
    | ChatCardMessage
    | FileMessage
    | StickerMessage
    | AudioMessage
    | VideoMessage
    | InteractiveMessage;
