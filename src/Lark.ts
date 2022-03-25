import { cache } from 'web-utility';
import { HTTPClient, polyfill } from 'koajax';

import { TenantAccessToken } from './type';
import { SpreadSheet } from './SpreadSheet';
import { BITable } from './BITable';

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

        return (this.accessToken = await this.getTenantAccessToken());
    }

    /**
     * @see https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal
     */
    getTenantAccessToken = cache(async clean => {
        const { body } = await this.client.post<TenantAccessToken>(
            'auth/v3/tenant_access_token/internal',
            {
                app_id: this.appId,
                app_secret: this.appSecret
            }
        );
        setTimeout(clean, body!.expire * 1000);

        return body!.tenant_access_token;
    }, 'Tenant Access Token');

    async getSpreadSheet(id: string) {
        await this.getAccessToken();

        const spreadsheet = new SpreadSheet(this, id);

        await spreadsheet.getMetaInfo();

        return spreadsheet;
    }

    async getBITable(id: string) {
        await this.getAccessToken();

        const biTable = new BITable(this, id);

        await biTable.getMetaInfo();

        return biTable;
    }

    /**
     * @see https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/download
     */
    async downloadFile(id: string) {
        const { body } = await this.client.request<Blob>({
            path: `drive/v1/medias/${id}/download`,
            responseType: 'blob'
        });
        return body!;
    }
}
