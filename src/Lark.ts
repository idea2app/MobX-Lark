import { buildURLData, cache } from 'web-utility';
import { HTTPClient, polyfill } from 'koajax';

import { TenantAccessToken, JSTicket, UserMeta } from './type';
import { InstantMessenger } from './module/InstantMessenger';
import { SpreadSheet } from './module/SpreadSheet';
import { BITable } from './module/BITable';

export interface LarkOptions {
    appId: string;
    appSecret: string;
}

export class Lark implements LarkOptions {
    appId: string;
    appSecret: string;
    accessToken?: string;

    messenger = new InstantMessenger(this);

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

    /**
     * @see https://open.feishu.cn/document/ukTMukTMukTM/ukzN4UjL5cDO14SO3gTN
     */
    getWebSignInURL(redirect_uri: string, state?: string) {
        return `${this.client.baseURI}/authen/v1/index?${buildURLData({
            app_id: this.appId,
            redirect_uri,
            state
        })}`;
    }

    /**
     * @see https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/authen-v1/authen/access_token
     */
    async getUserMeta(code: string) {
        const { body } = await this.client.post<UserMeta>(
            'authen/v1/access_token',
            { grant_type: 'authorization_code', code }
        );
        return body!.data;
    }

    /**
     * @see https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/h5_js_sdk/authorization
     */
    async getJSTicket() {
        const { body } = await this.client.post<JSTicket>('jssdk/ticket/get');

        return body!.data;
    }

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
        await this.getAccessToken();

        const { body } = await this.client.request<ArrayBuffer>({
            path: `drive/v1/medias/${id}/download`,
            responseType: 'arraybuffer'
        });
        return body!;
    }
}
