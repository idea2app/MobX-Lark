# MobX-Lark

Unofficial [TypeScript][1] SDK for [FeiShu/Lark API][2], which is based on [MobX-RESTful][3].

[![MobX compatibility](https://img.shields.io/badge/Compatible-1?logo=mobx&label=MobX%206%2F7)][4]
[![NPM Dependency](https://img.shields.io/librariesio/github/idea2app/MobX-Lark.svg)][5]
[![CI & CD](https://github.com/idea2app/MobX-Lark/actions/workflows/main.yml/badge.svg)][6]

[![NPM](https://nodei.co/npm/mobx-lark.png?downloads=true&downloadRank=true&stars=true)][7]

## Versions

|   SemVer   |  branch  |    status    | ES decorator |    MobX     |
| :--------: | :------: | :----------: | :----------: | :---------: |
|   `>=2`    |  `main`  | ✅developing |   stage-3    |  `>=6.11`   |
| `>=0.8 <2` |  `main`  | ❌deprecated |   stage-2    | `>=4 <6.11` |
|   `<0.8`   | `master` | ❌deprecated |              |             |

## Usage

- [Example](test/index.spec.ts)
    - [SpreadSheet example](https://idea2app.feishu.cn/wiki/RQXiwdDvtiPz6HkokTqcVDZWnhg)
    - [BI Table example](https://idea2app.feishu.cn/wiki/Jzqbwv4biiY1Ckkqf95cS97Ynig)
- [API document](https://idea2app.github.io/MobX-Lark/)

### 1. Initialization

#### User access token (front-end)

```ts
import { LarkApp } from 'mobx-lark';
import { parseCookie } from 'web-utility';

const { token } = parseCookie();

export const larkApp = new LarkApp({
    id: process.env.LARK_APP_ID,
    accessToken: token // or other getting way of OAuth token
});
```

##### OAuth middleware for Next.js

1. [Initialization](https://github.com/idea2app/Lark-Next-Bootstrap-ts/blob/afa51fad3b16e598bf3b10010b2dc47405b016a3/pages/api/Lark/core.ts#L40-L48)

2. Page router usage:

    ```ts
    import { compose } from 'next-ssr-middleware';

    import { larkOAuth2 } from '../utility/lark';

    export const getServerSideProps = compose(larkOAuth2);
    ```

#### Tenant access token (back-end)

```ts
import { LarkApp } from 'mobx-lark';

export const larkApp = new LarkApp({
    id: process.env.LARK_APP_ID,
    secret: process.env.LARK_APP_SECRET
});
```

### 2. Defination

For example, we use a BI Table as a database:

```ts
import { BiDataQueryOptions, BiDataTable, TableCellValue } from 'mobx-lark';

import { larkClient } from '../utility/lark';
import { LarkBaseId } from '../configuration';

export type Client = Record<
    'id' | 'name' | 'type' | 'partnership' | 'image' | 'summary' | 'address',
    TableCellValue
>;

const CLIENT_TABLE = process.env.NEXT_PUBLIC_CLIENT_TABLE!;

export class ClientModel extends BiDataTable<Client>() {
    client = lark.client;

    queryOptions: BiDataQueryOptions = { text_field_as_array: false };

    constructor(appId = LarkBaseId, tableId = CLIENT_TABLE) {
        super(appId, tableId);
    }
}
```

### 3. Querying

Use Next.js page router for example:

```tsx
import { FC } from 'react';

import { lark } from '../utility/lark';
import { Client, ClientModel } from '../models/Client';

export const getServerSideProps = async () => {
    await lark.getAccessToken();

    const clientStore = new ClientModel();

    const fullList = await clientStore.getAll();

    return { props: { fullList } };
};

const ClientIndexPage: FC<{ fullList: Client[] }> = ({ fullList }) => (
    <main>
        <h1>Client List</h1>
        <ol>
            {fullList.map(({ id, name }) => (
                <li key={id}>{name}</li>
            ))}
        </ol>
    </main>
);

export default ClientIndexPage;
```

## Scaffolds

1. https://github.com/idea2app/Lark-Next-Bootstrap-ts

## User cases

1. [idea2app web-site](https://github.com/idea2app/idea2app.github.io/tree/main/models)
2. [KaiYuanShe web-site](https://github.com/kaiyuanshe/kaiyuanshe.github.io/tree/main/models)

## Related with

- Lark client API: https://github.com/idea2app/Lark-client-API

[1]: https://www.typescriptlang.org/
[2]: https://open.feishu.cn/
[3]: https://github.com/idea2app/MobX-RESTful
[4]: https://mobx.js.org/
[5]: https://libraries.io/npm/mobx-lark
[6]: https://github.com/idea2app/MobX-Lark/actions/workflows/main.yml
[7]: https://nodei.co/npm/mobx-lark/
