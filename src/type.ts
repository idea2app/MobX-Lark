export type LarkData<
    D extends Record<string, any> = {},
    E extends Record<string, any> = {}
> = E & {
    code: number;
    msg: string;
    data?: D;
    error?: {
        log_id: string;
        [key: string]: any;
    };
};

export type LarkPageData<D extends Record<string, any> = {}> = LarkData<{
    page_token: string;
    items: D[];
    has_more: boolean;
    total?: number;
}>;

export function isLarkError(data?: any): data is LarkData {
    return !!(data as LarkData)?.code;
}

export type TenantAccessToken = LarkData<
    {},
    {
        expire: number;
        tenant_access_token: string;
    }
>;

export type UserIdType = `${'open' | 'union' | 'user'}_id`;

export type LocaleUser = Record<
    `${'' | 'en_'}name` | `${'' | 'enterprise_'}email`,
    string
>;

export interface UserMeta
    extends LocaleUser,
        Record<
            | `avatar_${'url' | 'thumb' | 'middle' | 'big'}`
            | UserIdType
            | 'mobile'
            | 'tenant_key'
            | 'employee_no'
            | `${'access' | 'refresh'}_token`,
            string
        >,
        Record<`${'' | 'refresh_'}expires_in`, number> {
    token_type: 'Bearer';
}

export interface JSTicket {
    expire_in: number;
    ticket: string;
}

export type I18nKey = `${string}_${string}`;

export type TranslationMap = Record<I18nKey, string>;

export type UploadTargetType =
    | 'doc_image'
    | 'docx_image'
    | 'sheet_image'
    | 'doc_file'
    | 'docx_file'
    | 'sheet_file'
    | 'vc_virtual_background'
    | 'bitable_image'
    | 'bitable_file'
    | 'moments'
    | 'ccm_import_open';
