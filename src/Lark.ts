import { Context, HTTPClient, makeFormData, request } from 'koajax';
import { buildURLData, cache, Second } from 'web-utility';

import {
    isLarkError,
    JSTicket,
    LarkData,
    TenantAccessToken,
    UserMeta
} from './type';

export interface LarkAppOption {
    host?: string;
    id: string;
    secret?: string;
}

export class LarkApp implements LarkAppOption {
    host?: string;
    id: string;
    secret?: string;

    client: HTTPClient<Context>;
    accessToken?: string;

    constructor({
        host = 'https://open.feishu.cn/open-apis/',
        id,
        secret
    }: LarkAppOption) {
        console.assert(
            !globalThis.window || !secret,
            "App Secret can't be used in client"
        );
        this.host = host;
        this.id = id;
        this.secret = secret;

        this.client = new HTTPClient({ baseURI: host, responseType: 'json' });

        this.boot();
    }

    private boot() {
        this.client.use(async ({ request, response }, next) => {
            const { accessToken } = this;

            if (accessToken)
                request.headers = {
                    ...request.headers,
                    Authorization: `Bearer ${accessToken}`
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

    getAccessToken() {
        return this.getTenantAccessToken();
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
            delete this.accessToken;
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
    async getUserMeta(code: string) {
        await this.getAccessToken();

        const { body } = await this.client.post<UserMeta>(
            'authen/v1/access_token',
            { grant_type: 'authorization_code', code }
        );
        return body!.data;
    }

    /**
     * @see {@link https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/h5_js_sdk/authorization}
     */
    getJSTicket = cache(async clean => {
        await this.getAccessToken();

        const { body } = await this.client.post<JSTicket>('jssdk/ticket/get');
        const { expire_in, ticket } = body!.data;

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
    async uploadFile(file: File, parent_node: string) {
        const token = await this.getAccessToken();

        const body = makeFormData({
            file,
            file_name: file.name,
            size: file.size,
            parent_type:
                file.type.split('/')[0] === 'image'
                    ? 'bitable_image'
                    : 'bitable_image',
            parent_node
        });
        const { response } = request<LarkData<{ file_token: string }>>({
            method: 'POST',
            path: this.client.baseURI + 'drive/v1/medias/upload_all',
            headers: { Authorization: `Bearer ${token}` },
            body
        });
        const { file_token } = (await response).body!.data;

        return file_token;
    }
}
