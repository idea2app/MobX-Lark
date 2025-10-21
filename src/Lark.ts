import { Context, HTTPClient, makeFormData } from 'koajax';
import { buildURLData, cache, sleep } from 'web-utility';

import { DocumentModel, WikiNodeModel } from './module';
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

export interface LarkAppOption extends LarkAppServerOption, LarkAppClientOption {}

export class LarkApp implements LarkAppOption {
    host = 'https://open.feishu.cn/open-apis/';
    id = '';
    secret = '';

    client: HTTPClient<Context>;
    accessToken = '';

    constructor(option: LarkAppServerOption | LarkAppClientOption) {
        Object.assign(this, option);

        console.assert(!globalThis.window || !this.secret, "App Secret can't be used in client");

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
        return code ? this.getUserAccessToken(code) : this.getTenantAccessToken();
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
        sleep(body!.expire).then(() => {
            this.accessToken = '';
            clean();
        });
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
        const { body } = await this.client.post<LarkData<UserMeta>>('authen/v1/access_token', {
            grant_type: 'authorization_code',
            code
        });
        const { expires_in, access_token } = body!.data!;

        sleep(expires_in).then(() => {
            this.accessToken = '';
            clean();
        });
        return (this.accessToken = access_token);
    }, 'User Access Token');

    /**
     * @see {@link https://open.feishu.cn/document/server-docs/authentication-management/login-state-management/get}
     */
    async getUserMeta() {
        const { body } = await this.client.get<LarkData<UserMeta>>('authen/v1/user_info');

        return body!.data!;
    }

    /**
     * @see {@link https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/h5_js_sdk/authorization}
     */
    getJSTicket = cache(async clean => {
        await this.getAccessToken();

        const { body } = await this.client.post<LarkData<JSTicket>>('jssdk/ticket/get');

        const { expire_in, ticket } = body!.data!;

        sleep(expire_in).then(clean);

        return ticket;
    }, 'JS ticket');

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/download}
     */
    async downloadFile(id: string) {
        await this.getAccessToken();

        const { headers, body } = await this.client.get<Blob>(
            `drive/v1/medias/${id}/download`,
            {},
            { responseType: 'blob' }
        );
        const { 'Content-Disposition': CD, 'Content-Type': CT } = headers;

        const [type] = (CT as string)?.split(';') || [],
            [, fileName] = (CD as string)?.match(/filename="?(.*?)"?$/) || [];

        return new File([body!], fileName, { type });
    }

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_all}
     */
    async uploadFile(file: File, parent_type: UploadTargetType, parent_node: string) {
        await this.getAccessToken();

        const form = makeFormData({
            file,
            file_name: file.name,
            size: file.size,
            parent_type,
            parent_node
        });
        const { body } = await this.client.post<LarkData<{ file_token: string }>>(
            'drive/v1/medias/upload_all',
            form
        );
        return body!.data!.file_token;
    }

    /**
     * @see {@link WikiNodeModel.getOne}
     */
    async wiki2docx(id: string) {
        await this.getAccessToken();

        const { client } = this;

        class InternalWikiNodeModel extends WikiNodeModel {
            client = client;
        }
        const { obj_type, obj_token } = await new InternalWikiNodeModel('', '').getOne(id);

        return obj_type === 'docx' ? obj_token : '';
    }

    static documentPathPattern = /(wiki|docx)\/(\w+)/;

    /**
     * @see {@link DocumentModel#getOneContent}
     */
    async downloadMarkdown(URI: string) {
        await this.getAccessToken();

        const [, type, id] = URI.match(LarkApp.documentPathPattern) || [];

        const doc_token = type === 'wiki' ? await this.wiki2docx(id) : id,
            { client } = this;

        class InternalDocumentModel extends DocumentModel {
            client = client;
        }
        return new InternalDocumentModel('').getOneContent(doc_token, 'markdown');
    }
}
