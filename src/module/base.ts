import { Lark } from '../Lark';

export abstract class LarkModule {
    core: Lark;
    id?: string;
    abstract baseURI: string;

    constructor(core: Lark, id?: string) {
        this.core = core;
        this.id = id;
    }
}
