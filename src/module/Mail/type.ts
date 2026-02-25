export interface MailAddress {
    mail_address: string;
    name?: string;
}

export enum MailAttachmentType {
    Normal = 1,
    Large = 2
}

export interface MailAttachment {
    attachment_type: MailAttachmentType;
    id: string;
    cid?: string;
    filename: string;
    is_inline: boolean;
}

export enum MailMessageState {
    Received = 1,
    Sent = 2,
    Draft = 3
}

export type MailMessage = Record<
    | `${'smtp_' | ''}message_id`
    | 'thread_id'
    | 'internal_date'
    | 'subject'
    | `body_${'plain_text' | 'html'}`,
    string
> &
    Record<'to' | 'cc' | 'bcc', MailAddress[]> & {
        dedupe_key?: string;
        message_state: MailMessageState;
        head_from: MailAddress;
        raw?: string;
        attachments: MailAttachment[];
    };
