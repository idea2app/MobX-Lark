import { IDType, ListModel, Stream, toggle } from 'mobx-restful';
import { buildURLData } from 'web-utility';

import { LarkData } from '../../type';
import { createPageStream } from '../base';
import { Task, TaskList, TaskSummary } from './type';

export abstract class TaskModel extends Stream<Task>(ListModel) {
    constructor(tasklist_guid: string) {
        super();
        this.baseURI = `task/v2/tasklists/${tasklist_guid}/tasks`;
    }

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/tasklist/tasks}
     */
    async *openStream() {
        for await (const { guid } of createPageStream<TaskSummary>(
            this.client,
            this.baseURI,
            total => (this.totalCount = total)
        ))
            yield await this.getOne(guid);
    }

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/task/get}
     */
    async getOne(
        id: string,
        user_id_type: 'union_id' | 'open_id' = 'union_id'
    ) {
        const { body } = await this.client.get<LarkData<{ task: Task }>>(
            `${this.baseURI}/${id}?${buildURLData({ user_id_type })}`
        );
        return (this.currentOne = body!.data!.task);
    }
}

export abstract class TaskListModel extends Stream<TaskList>(ListModel) {
    baseURI = 'task/v2/tasklists';

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/tasklist/list}
     */
    async *openStream() {
        for await (const item of createPageStream<TaskList>(
            this.client,
            this.baseURI,
            total => (this.totalCount = total)
        ))
            yield item;
    }

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/tasklist/get}
     */
    @toggle('downloading')
    async getOne(
        id: IDType,
        user_id_type: 'union_id' | 'open_id' = 'union_id'
    ) {
        const { body } = await this.client.get<
            LarkData<{ tasklist: TaskList }>
        >(`${this.baseURI}/${id}?${buildURLData({ user_id_type })}`);

        return (this.currentOne = body!.data!.tasklist);
    }
}
