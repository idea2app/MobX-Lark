import fetch from 'node-fetch';
// @ts-ignore
globalThis.fetch ||= fetch;

export * from './type';
export * from './Lark';
// export * from './module';
export * from './module/SpreadSheet';
export * from './module/BITable';
