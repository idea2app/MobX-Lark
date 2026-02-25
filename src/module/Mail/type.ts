export interface MailAddress {
    mail_address: string;
    name?: string;
}

export interface MailBody {
    content: string;
    content_type?: 'html' | 'plain_text';
}

export interface MailAttachment {
    attachment_id: string;
    name: string;
    size: number;
}

export interface MailMessage {
    message_id: string;
    time: string;
    snippet: string;
    subject: string;
    from: MailAddress;
    to: MailAddress[];
    cc?: MailAddress[];
    bcc?: MailAddress[];
    head_from?: MailAddress;
    reply_to?: MailAddress[];
    body?: MailBody;
    attachments?: MailAttachment[];
    external?: boolean;
    labels?: string[];
}

export type MailMessageSummary = Pick<MailMessage, 'message_id'>;

export type SendMailMessage = Pick<MailMessage, 'subject' | 'to'> &
    Partial<Pick<MailMessage, 'cc' | 'bcc' | 'head_from' | 'reply_to'>> &
    Required<Pick<MailMessage, 'body'>> & {
        attachments?: Pick<MailAttachment, 'attachment_id'>[];
    };
