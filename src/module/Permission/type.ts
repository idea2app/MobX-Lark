import { LarkDocumentType } from '../../type';

export type PermissionFileType = LarkDocumentType | 'wiki' | 'minutes';

export type ExternalAccessEntity = 'open' | 'closed' | 'allow_share_partner_tenant';

export type SecurityEntity = 'anyone_can_view' | 'anyone_can_edit' | 'only_full_access';

export type CommentEntity = 'anyone_can_view' | 'anyone_can_edit';

export type ShareEntity = 'anyone' | 'same_tenant';

export type ManageCollaboratorEntity =
    | 'collaborator_can_view'
    | 'collaborator_can_edit'
    | 'collaborator_full_access';

export type LinkShareEntity =
    | 'tenant_readable'
    | 'tenant_editable'
    | 'partner_tenant_readable'
    | 'partner_tenant_editable'
    | 'anyone_readable'
    | 'anyone_editable'
    | 'closed';

export type CopyEntity = 'anyone_can_view' | 'anyone_can_edit' | 'only_full_access';

export interface PermissionPublic {
    external_access_entity?: ExternalAccessEntity;
    security_entity?: SecurityEntity;
    comment_entity?: CommentEntity;
    share_entity?: ShareEntity;
    manage_collaborator_entity?: ManageCollaboratorEntity;
    link_share_entity?: LinkShareEntity;
    copy_entity?: CopyEntity;
}

export interface PermissionPublicResponse {
    permission_public: Record<
        | 'external_access_entity'
        | 'security_entity'
        | 'comment_entity'
        | 'share_entity'
        | 'manage_collaborator_entity'
        | 'link_share_entity'
        | 'copy_entity'
        | 'lock_switch',
        string
    >;
}

export interface PasswordResponse {
    password: string;
}
