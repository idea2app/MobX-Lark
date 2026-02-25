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

export interface SendMailMessage {
    subject: string;
    to: MailAddress[];
    cc?: MailAddress[];
    bcc?: MailAddress[];
    head_from?: MailAddress;
    body: MailBody;
    attachments?: Pick<MailAttachment, 'attachment_id'>[];
}
