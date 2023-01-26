import { LarkApp } from '../Lark';

export abstract class LarkModule {
    core: LarkApp;
    id?: string;
    abstract baseURI: string;

    constructor(core: LarkApp, id?: string) {
        this.core = core;
        this.id = id;
    }
}
