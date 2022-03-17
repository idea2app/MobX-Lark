import { HTTPClient, polyfill } from 'koajax';

import { TenantAccessToken } from './type';
import { SpreadSheet } from './SpreadSheet';

export interface LarkOptions {
    appId: string;
    appSecret: string;
}

export class Lark implements LarkOptions {
    appId: string;
    appSecret: string;
    accessToken?: string;

    constructor({ appId, appSecret }: LarkOptions) {
        this.appId = appId;
        this.appSecret = appSecret;
    }

    client = new HTTPClient({
        baseURI: 'https://open.feishu.cn/open-apis/',
        responseType: 'json'
    }).use(async ({ request, response }, next) => {
        const { accessToken } = this;

        if (accessToken)
            request.headers = {
                ...request.headers,
                Authorization: `Bearer ${accessToken}`
            };

        try {
            await next();
        } catch (error) {
            const { body } = response;

            console.error(body);
            throw error;
        }
    });

    async getAccessToken() {
        await polyfill(new URL(this.client.baseURI).origin);

        return (this.accessToken ||= await this.getTenantAccessToken());
    }

    protected async getTenantAccessToken() {
        const { body } = await this.client.post<TenantAccessToken>(
            'auth/v3/tenant_access_token/internal',
            {
                app_id: this.appId,
                app_secret: this.appSecret
            }
        );
        return body!.tenant_access_token;
    }

    async getSpreadSheet(id: string) {
        const spreadsheet = new SpreadSheet(this, id);

        await spreadsheet.getMetaInfo();

        return spreadsheet;
    }
}
