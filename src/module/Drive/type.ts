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

export type ExternalAccessEntity = 'open' | 'closed' | 'allow_share_partner_tenant';

export type SecurityEntity = 'anyone_can_view' | 'anyone_can_edit' | 'only_full_access';

export type CommentEntity = 'anyone_can_view' | 'anyone_can_edit';

export type ShareEntity = 'anyone' | 'same_tenant';

export type ManageCollaboratorEntity =
    | 'collaborator_can_view'
    | 'collaborator_can_edit'
    | 'collaborator_full_access';

export type LinkShareEntity = 'tenant_readable' | 'tenant_editable' | 'partner_tenant_readable';

export interface PublicPermission {
    external_access_entity?: ExternalAccessEntity;
    security_entity?: SecurityEntity;
    comment_entity?: CommentEntity;
    share_entity?: ShareEntity;
    manage_collaborator_entity?: ManageCollaboratorEntity;
    link_share_entity?: LinkShareEntity;
}

export interface PasswordResponse {
    password: string;
}
