import { LarkDocumentType } from '../../type';

export type DriveFile = Record<
    | `doc_${'token' | 'type'}`
    | 'title'
    | 'owner_id'
    | 'create_time'
    | `latest_modify_${'user' | 'time'}`
    | 'url'
    | 'sec_label_name',
    string
>;

export type CopiedFile = Record<'type' | `${'parent_' | ''}token` | 'name' | 'url', string>;

export type DriveFileType = LarkDocumentType | 'minutes' | 'folder' | 'wiki';

export interface TransferOwner {
    member_type: 'email' | 'userid' | 'openid';
    member_id: string;
}

export interface TransferOption {
    need_notification?: boolean;
    remove_old_owner?: boolean;
    stay_put?: boolean;
    old_owner_perm?: 'view' | 'edit' | 'full_access';
}
