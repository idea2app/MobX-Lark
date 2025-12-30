import { Context, HTTPClient } from 'koajax';
import { buildURLData, cache, sleep } from 'web-utility';

import {
    CopiedFile,
    DocumentModel,
    DriveFileModel,
    UserIdType,
    WikiNode,
    WikiNodeModel
} from './module';
import {
    getLarkDocumentType,
    isLarkError,
    JSTicket,
    LarkData,
    LarkDocumentPathType,
    LarkDocumentType,
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

    driveFileStore: DriveFileModel;
    wikiNodeStore: WikiNodeModel;
    documentStore: DocumentModel;

    constructor(option: LarkAppServerOption | LarkAppClientOption) {
        Object.assign(this, option);

        console.assert(!globalThis.window || !this.secret, "App Secret can't be used in client");

        this.client = new HTTPClient({
            baseURI: this.host,
            responseType: 'json'
        });
        this.boot();

        const { client } = this;

        this.driveFileStore = new (class extends DriveFileModel {
            client = client;
        })();
        this.wikiNodeStore = new (class extends WikiNodeModel {
            client = client;
        })('', '');
        this.documentStore = new (class extends DocumentModel {
            client = client;
        })('');
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
     * @see {@link DriveFileModel#downloadOne}
     */
    async downloadFile(id: string) {
        await this.getAccessToken();

        return this.driveFileStore.downloadOne(id);
    }

    /**
     * @see {@link DriveFileModel#uploadOne}
     */
    async uploadFile(file: File, parent_type: UploadTargetType, parent_node: string) {
        await this.getAccessToken();

        return this.driveFileStore.uploadOne(file, parent_type, parent_node);
    }

    /**
     * @see {@link DriveFileModel#copyOne}
     * @see {@link WikiNodeModel#moveDocument}
     */
    copyFile(
        URI: `${string}wiki/${string}`,
        name?: string,
        parent_node_token?: string,
        user_id_type?: UserIdType
    ): Promise<WikiNode>;
    copyFile(
        URI: `${string}${LarkDocumentPathType}/${string}`,
        name?: string,
        folder_token?: string,
        user_id_type?: UserIdType
    ): Promise<CopiedFile>;
    async copyFile(URI: string, name?: string, folder_token?: string, user_id_type?: UserIdType) {
        await this.getAccessToken();

        let [[type, token]] = DriveFileModel.parseURI(URI),
            space_id: string | undefined,
            parent_node_token: string | undefined;

        if (type === 'wiki')
            ({
                obj_type: type,
                obj_token: token,
                space_id,
                parent_node_token
            } = await this.wiki2drive(token));
        else {
            type = getLarkDocumentType(type as LarkDocumentPathType);
        }

        const copidFile = await this.driveFileStore.copyOne(
            type as LarkDocumentType,
            token,
            name,
            folder_token,
            user_id_type
        );
        if (!space_id) return copidFile;

        const { client } = this;

        class InternalWikiNodeModel extends WikiNodeModel {
            client = client;
        }
        const wikiNodeStore = new InternalWikiNodeModel('', space_id);

        return wikiNodeStore.moveDocument(
            { obj_type: type, obj_token: copidFile.token } as WikiNode,
            folder_token || parent_node_token
        );
    }

    /**
     * @see {@link WikiNodeModel#getOne}
     */
    async wiki2drive(id: string) {
        await this.getAccessToken();

        return this.wikiNodeStore.getOne(id);
    }

    /**
     * @deprecated Use {@link LarkApp#wiki2drive} instead
     */
    async wiki2docx(id: string) {
        const { obj_type, obj_token } = await this.wiki2drive(id);

        return obj_type === 'docx' ? obj_token : '';
    }

    /**
     * @see {@link DocumentModel#getOneContent}
     */
    async downloadMarkdown(URI: string) {
        await this.getAccessToken();

        const [[type, id]] = DriveFileModel.parseURI(URI);

        const doc_token = type === 'wiki' ? (await this.wiki2drive(id)).obj_token : id;

        return this.documentStore.getOneContent(doc_token, 'markdown');
    }
}
