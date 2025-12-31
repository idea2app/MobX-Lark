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

export type CopiedFile = Record<'token' | 'type' | 'name' | 'parent_token' | 'url', string>;

export type DriveFileType =
    | `doc${'' | 'x'}`
    | 'sheet'
    | 'file'
    | 'wiki'
    | 'bitable'
    | 'folder'
    | 'mindnote'
    | 'slides';

export interface TransferOwnerRequest {
    owner_id: string;
    remove_old_owner?: boolean;
    cancel_notification?: boolean;
}
