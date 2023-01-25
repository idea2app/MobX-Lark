import { Context, HTTPClient } from 'koajax';
import { cache, Second } from 'web-utility';

import { isLarkError, TenantAccessToken } from './type';

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
}
