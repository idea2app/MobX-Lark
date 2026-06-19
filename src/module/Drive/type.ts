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
export type PublicFileType = Exclude<DriveFileType, 'folder'>;

export type PublicPermissionLevel = 'anyone_can_view' | 'anyone_can_edit' | 'only_full_access';
export type PublicCommentEntity = 'anyone_can_view' | 'anyone_can_edit';
export type PublicShareEntity = 'anyone' | 'same_tenant';
export type PublicCollaboratorEntity =
    | 'collaborator_can_view'
    | 'collaborator_can_edit'
    | 'collaborator_full_access';
export type PublicExternalAccessEntity = 'open' | 'closed' | 'allow_share_partner_tenant';
export type PublicLinkShareEntity =
    | 'tenant_readable'
    | 'tenant_editable'
    | 'partner_tenant_readable'
    | 'partner_tenant_editable'
    | 'anyone_readable'
    | 'anyone_editable'
    | 'closed';

export interface PermissionPublic {
    external_access_entity: PublicExternalAccessEntity;
    security_entity: PublicPermissionLevel;
    comment_entity: PublicCommentEntity;
    share_entity: PublicShareEntity;
    manage_collaborator_entity: PublicCollaboratorEntity;
    link_share_entity: PublicLinkShareEntity;
    copy_entity: PublicPermissionLevel;
    lock_switch: boolean;
}

export type PublicPermissionPatch = Partial<Omit<PermissionPublic, 'lock_switch'>>;

export interface PublishedFile {
    permissionPublic: Partial<PermissionPublic>;
    password?: string;
}

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
