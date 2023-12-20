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

export type LocaleUser = Record<`${'' | 'en_'}name` | 'email', string>;

export type UserMeta = LarkData<
    { token_type: 'Bearer' } & LocaleUser &
        Record<
            | `avatar_${'url' | 'thumb' | 'middle' | 'big'}`
            | `${'open' | 'union' | 'user'}_id`
            | 'mobile'
            | 'tenant_key'
            | `${'access' | 'refresh'}_token`,
            string
        > &
        Record<`${'' | 'refresh_'}expires_in`, number>
>;

export type JSTicket = LarkData<{
    expire_in: number;
    ticket: string;
}>;

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
