import { Context, HTTPClient, makeFormData } from 'koajax';
import { buildURLData, cache, Second } from 'web-utility';

import { LarkWikiNode } from './module';
import {
    isLarkError,
    JSTicket,
    LarkData,
    TenantAccessToken,
    UploadTargetType,
    UserMeta
} from './type';

export interface LarkAppBaseOption {
    host?: string;
    id: string;
}

export interface LarkAppServerOption extends LarkAppBaseOption {
    secret: string;
}

export interface LarkAppClientOption extends LarkAppBaseOption {
    accessToken: string;
}

export interface LarkAppOption
    extends LarkAppServerOption,
        LarkAppClientOption {}

export class LarkApp implements LarkAppOption {
    host = 'https://open.feishu.cn/open-apis/';
    id = '';
    secret = '';

    client: HTTPClient<Context>;
    accessToken = '';

    constructor(option: LarkAppServerOption | LarkAppClientOption) {
        Object.assign(this, option);

        console.assert(
            !globalThis.window || !this.secret,
            "App Secret can't be used in client"
        );
        this.client = new HTTPClient({
            baseURI: this.host,
            responseType: 'json'
        });
        this.boot();
    }

    private boot() {
        this.client.use(async ({ request, response }, next) => {
            const { accessToken } = this;

            if (accessToken)
                request.headers = {
                    Authorization: `Bearer ${accessToken}`,
                    ...request.headers
                };
            try {
                await next();

                const { body } = response;

                if (isLarkError(body)) {
                    console.error(body);
                    throw new URIError(body.msg);
                }
            } catch (error) {
                const { method, path } = request,
                    { status, body } = response;

                console.error(method, path, status, body);
                throw error;
            }
        });
    }

    getAccessToken(code = '') {
        return code
            ? this.getUserAccessToken(code)
            : this.getTenantAccessToken();
    }

    /**
     * Back-end only
     *
     * @see {@link https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal}
     */
    getTenantAccessToken = cache(async clean => {
        const { id, secret } = this;

        console.assert(id && secret, 'Id & Secret of Lark App are required');

        const { body } = await this.client.post<TenantAccessToken>(
            'auth/v3/tenant_access_token/internal',
            { app_id: id, app_secret: secret }
        );
        setTimeout(() => {
            this.accessToken = '';
            clean();
        }, body!.expire * Second);

        return (this.accessToken = body!.tenant_access_token);
    }, 'Tenant Access Token');

    /**
     * @see {@link https://open.feishu.cn/document/ukTMukTMukTM/ukzN4UjL5cDO14SO3gTN}
     */
    getWebSignInURL(redirect_uri: string, state?: string) {
        return `${this.client.baseURI}authen/v1/index?${buildURLData({
            app_id: this.id,
            redirect_uri,
            state
        })}`;
    }

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/authen-v1/authen/access_token}
     */
    getUserAccessToken = cache(async (clean, code: string) => {
        const { body } = await this.client.post<LarkData<UserMeta>>(
            'authen/v1/access_token',
            { grant_type: 'authorization_code', code }
        );
        const { expires_in, access_token } = body!.data!;

        setTimeout(() => {
            this.accessToken = '';
            clean();
        }, expires_in * Second);

        return (this.accessToken = access_token);
    }, 'User Access Token');

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/authentication-management/login-state-management/get}
     */
    async getUserMeta() {
        const { body } = await this.client.get<LarkData<UserMeta>>(
            'authen/v1/user_info'
        );
        return body!.data!;
    }

    /**
     * @see {@link https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/h5_js_sdk/authorization}
     */
    getJSTicket = cache(async clean => {
        await this.getAccessToken();

        const { body } =
            await this.client.post<LarkData<JSTicket>>('jssdk/ticket/get');
        const { expire_in, ticket } = body!.data!;

        setTimeout(clean, expire_in * Second);

        return ticket;
    }, 'JS ticket');

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/download}
     */
    async downloadFile(id: string) {
        await this.getAccessToken();

        const { body } = await this.client.request<ArrayBuffer>({
            path: `drive/v1/medias/${id}/download`,
            responseType: 'arraybuffer'
        });
        return body!;
    }

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_all}
     */
    async uploadFile(
        file: File,
        parent_type: UploadTargetType,
        parent_node: string
    ) {
        await this.getAccessToken();

        const form = makeFormData({
            file,
            file_name: file.name,
            size: file.size,
            parent_type,
            parent_node
        });
        const { body } = await this.client.post<
            LarkData<{ file_token: string }>
        >('drive/v1/medias/upload_all', form);

        return body!.data!.file_token;
    }

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/docs/wiki-v2/space-node/get_node}
     */
    async wiki2docx(id: string) {
        await this.getAccessToken();

        const { body } = await this.client.get<
            LarkData<{ node: LarkWikiNode }>
        >(`wiki/v2/spaces/get_node?token=${id}`);

        const { obj_type, obj_token } = body!.data!.node;

        return obj_type === 'docx' ? obj_token : '';
    }

    static documentPathPattern = /(wiki|docx)\/(\w+)/;

    /**
     * @see {@link https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/docs-v1/content/get}
     */
    async downloadMarkdown(URI: string) {
        await this.getAccessToken();

        const [, type, id] = URI.match(LarkApp.documentPathPattern) || [];

        const doc_token = type === 'wiki' ? await this.wiki2docx(id) : id;

        const { body } = await this.client.get<LarkData<{ content: string }>>(
            `docs/v1/content?${new URLSearchParams({
                doc_type: 'docx',
                doc_token,
                content_type: 'markdown'
            })}`
        );
        return body!.data!.content;
    }
}
