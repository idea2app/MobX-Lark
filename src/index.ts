import fetch from 'node-fetch';
// @ts-ignore
globalThis.fetch ||= fetch;

export * from './type';
export * from './Lark';
export * from './LarkApp';
export * from './module';
export * from './model/BiDataTable';
