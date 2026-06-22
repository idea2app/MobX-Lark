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

type PublicEditableLevel = 'view' | 'edit';
type PublicLinkAccessLevel = 'readable' | 'editable';
type PublicLinkShareScope = `${'' | 'partner_'}tenant` | 'anyone';

export type PublicCommentEntity = `anyone_can_${PublicEditableLevel}`;
export type PublicPermissionLevel = PublicCommentEntity | 'only_full_access';
export type PublicShareEntity = 'anyone' | 'same_tenant';
export type PublicCollaboratorEntity =
    | `collaborator_can_${PublicEditableLevel}`
    | 'collaborator_full_access';
export type PublicExternalAccessEntity = 'open' | 'closed' | 'allow_share_partner_tenant';
export type PublicLinkShareEntity = `${PublicLinkShareScope}_${PublicLinkAccessLevel}` | 'closed';

export interface PublicPermission {
    external_access_entity: PublicExternalAccessEntity;
    security_entity: PublicPermissionLevel;
    comment_entity: PublicCommentEntity;
    share_entity: PublicShareEntity;
    manage_collaborator_entity: PublicCollaboratorEntity;
    link_share_entity: PublicLinkShareEntity;
    copy_entity: PublicPermissionLevel;
    lock_switch: boolean;
}

export type PublicPermissionPatch = Partial<Omit<PublicPermission, 'lock_switch'>>;

export interface PublishedFile {
    permission: PublicPermission;
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
