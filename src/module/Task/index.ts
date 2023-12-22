import { Filter, IDType, ListModel, Stream, toggle } from 'mobx-restful';
import { buildURLData } from 'web-utility';

import { LarkData, UserIdType } from '../../type';
import { createPageStream } from '../base';
import {
    TaskField,
    Task,
    TaskList,
    TaskListSection,
    TaskResourceType,
    TaskSummary
} from './type';

export interface TaskFilter extends Filter<Task> {
    user_id_type?: UserIdType;
}

export abstract class TaskModel extends Stream<Task, TaskFilter>(ListModel) {
    constructor(tasklist_guid: string) {
        super();
        this.baseURI = `task/v2/tasklists/${tasklist_guid}/tasks`;
    }

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/tasklist/tasks}
     */
    async *openStream({ user_id_type }: TaskFilter) {
        for await (const { guid } of createPageStream<TaskSummary>(
            this.client,
            this.baseURI,
            total => (this.totalCount = total)
        ))
            yield await this.getOne(guid, user_id_type);
    }

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/task/get}
     */
    @toggle('downloading')
    async getOne(id: string, user_id_type: UserIdType = 'union_id') {
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
    async getOne(id: IDType, user_id_type: UserIdType = 'union_id') {
        const { body } = await this.client.get<
            LarkData<{ tasklist: TaskList }>
        >(`${this.baseURI}/${id}?${buildURLData({ user_id_type })}`);

        return (this.currentOne = body!.data!.tasklist);
    }
}

export interface TaskListSectionFilter {
    resource_type: TaskResourceType;
    resource_id?: string;
}

export abstract class TaskListSectionModel extends Stream<
    TaskListSection,
    TaskListSectionFilter
>(ListModel) {
    baseURI = 'task/v2/sections';

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/section/list}
     */
    async *openStream(filter: TaskListSectionFilter) {
        for await (const { guid } of createPageStream<
            Pick<TaskListSection, 'guid' | 'name' | 'is_default'>
        >(
            this.client,
            this.baseURI,
            total => (this.totalCount = total),
            filter
        ))
            yield await this.getOne(guid);
    }

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/section/get}
     */
    @toggle('downloading')
    async getOne(id: string) {
        const { body } = await this.client.get<
            LarkData<{ section: TaskListSection }>
        >(`${this.baseURI}/${id}`);

        return (this.currentOne = body!.data!.section);
    }
}

export type TaskFieldFilter = Filter<TaskField> &
    Partial<TaskListSectionFilter>;

export abstract class TaskFieldModel extends Stream<TaskField, TaskFieldFilter>(
    ListModel
) {
    baseURI = 'task/v2/custom_fields';

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/custom_field/list}
     */
    async *openStream(filter: TaskFieldFilter) {
        for await (const item of createPageStream<TaskField>(
            this.client,
            this.baseURI,
            total => (this.totalCount = total),
            filter
        ))
            yield item;
    }
}
