import { Filter, IDType, ListModel, NewData, Stream, toggle } from 'mobx-restful';
import { buildURLData } from 'web-utility';

import { LarkData } from '../../type';
import { createPageStream } from '../base';
import { UserIdType } from '../User/type';
import { Task, TaskField, TaskList, TaskListSection, TaskResource, TaskSummary } from './type';

export * from './type';

export interface BaseTaskFilter {
    user_id_type?: UserIdType;
}

export interface TaskFilter
    extends Filter<Task>,
        BaseTaskFilter,
        Partial<TaskResource>,
        Record<`created_${'from' | 'to'}`, string> {
    completed?: boolean;
}

export abstract class TaskModel extends Stream<Task, TaskFilter>(ListModel) {
    baseURI = 'task/v2/tasks';

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/task/list}
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/tasklist/tasks}
     */
    async *openStream({
        resource_type = 'my_tasks',
        resource_id,
        user_id_type = 'union_id',
        ...rest
    }: TaskFilter) {
        if (resource_type === 'my_tasks')
            yield* createPageStream<Task>(
                this.client,
                this.baseURI,
                total => (this.totalCount = total),
                { type: resource_type, user_id_type, ...rest }
            );
        else {
            const stream = createPageStream<TaskSummary>(
                this.client,
                `task/v2/tasklists/${resource_id}/tasks`,
                total => (this.totalCount = total),
                { user_id_type, ...rest }
            );
            for await (const { guid } of stream) yield await this.getOne(guid, user_id_type);
        }
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

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/task/create}
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/task/patch}
     */
    @toggle('uploading')
    async updateOne(task: NewData<Task>, id?: string, user_id_type: UserIdType = 'union_id') {
        const path = `task/v2/tasks?${buildURLData({ user_id_type })}`;
        const { body } = id
            ? await this.client.patch<LarkData<{ task: Task }>>(path, {
                  task,
                  update_fields: Object.keys(task)
              })
            : await this.client.post<LarkData<{ task: Task }>>(path, task);

        return body!.data!.task;
    }
}

export type TaskListFilter = Filter<TaskList> & BaseTaskFilter;

export abstract class TaskListModel extends Stream<TaskList, TaskListFilter>(ListModel) {
    baseURI = 'task/v2/tasklists';

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/tasklist/list}
     */
    openStream({ user_id_type = 'union_id' }: TaskListFilter) {
        return createPageStream<TaskList>(
            this.client,
            this.baseURI,
            total => (this.totalCount = total),
            { user_id_type }
        );
    }

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/tasklist/get}
     */
    @toggle('downloading')
    async getOne(id: IDType, user_id_type: UserIdType = 'union_id') {
        const { body } = await this.client.get<LarkData<{ tasklist: TaskList }>>(
            `${this.baseURI}/${id}?${buildURLData({ user_id_type })}`
        );

        return (this.currentOne = body!.data!.tasklist);
    }

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/tasklist/create}
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/tasklist/patch}
     */
    @toggle('uploading')
    async updateOne(
        tasklist: NewData<TaskList>,
        id?: string,
        user_id_type: UserIdType = 'union_id'
    ) {
        const path = `${this.baseURI}?${buildURLData({ user_id_type })}`;
        const { body } = id
            ? await this.client.post<LarkData<{ tasklist: TaskList }>>(path, {
                  tasklist,
                  update_fields: Object.keys(tasklist)
              })
            : await this.client.post<LarkData<{ tasklist: TaskList }>>(path, tasklist);

        return body!.data!.tasklist;
    }
}

export type TaskListSectionFilter = Partial<TaskResource> & BaseTaskFilter;

export abstract class TaskListSectionModel extends Stream<TaskListSection, TaskListSectionFilter>(
    ListModel
) {
    baseURI = 'task/v2/sections';

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/section/list}
     */
    async *openStream({
        resource_type = 'my_tasks',
        resource_id,
        user_id_type = 'union_id'
    }: TaskListSectionFilter) {
        const stream = createPageStream<Pick<TaskListSection, 'guid' | 'name' | 'is_default'>>(
            this.client,
            this.baseURI,
            total => (this.totalCount = total),
            {
                resource_type,
                resource_id,
                user_id_type
            }
        );
        for await (const { guid } of stream) yield await this.getOne(guid);
    }

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/section/get}
     */
    @toggle('downloading')
    async getOne(id: string) {
        const { body } = await this.client.get<LarkData<{ section: TaskListSection }>>(
            `${this.baseURI}/${id}`
        );

        return (this.currentOne = body!.data!.section);
    }

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/section/create}
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/section/patch}
     */
    @toggle('uploading')
    async updateOne(
        section: NewData<TaskListSection>,
        id?: string,
        user_id_type: UserIdType = 'union_id',
        [target]: Partial<TaskResource>[] = []
    ) {
        const path = `${this.baseURI}?${buildURLData({ user_id_type })}`;
        const { body } = id
            ? await this.client.patch<LarkData<{ section: TaskListSection }>>(path, {
                  section,
                  update_fields: Object.keys(section)
              })
            : await this.client.post<LarkData<{ section: TaskListSection }>>(path, {
                  name: section.name,
                  ...target
              });
        return body!.data!.section;
    }
}

export type TaskFieldFilter = Filter<TaskField> & Partial<TaskListSectionFilter>;

export abstract class TaskFieldModel extends Stream<TaskField, TaskFieldFilter>(ListModel) {
    baseURI = 'task/v2/custom_fields';

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/custom_field/list}
     */
    openStream({
        resource_type = 'tasklist',
        resource_id,
        user_id_type = 'union_id'
    }: TaskFieldFilter) {
        return createPageStream<TaskField>(
            this.client,
            this.baseURI,
            total => (this.totalCount = total),
            { resource_type, resource_id, user_id_type }
        );
    }

    /**
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/custom_field/create}
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/custom_field/patch}
     * @see {@link https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/custom_field/add}
     */
    @toggle('uploading')
    async updateOne(
        data: NewData<TaskField>,
        id?: string,
        user_id_type: UserIdType = 'union_id',
        [target, ...targets]: TaskResource[] = []
    ) {
        const path = `${this.baseURI}?${buildURLData({ user_id_type })}`;
        const { body } = id
            ? await this.client.patch<LarkData<{ custom_field: TaskField }>>(path, {
                  custom_field: data,
                  update_fields: Object.keys(data)
              })
            : await this.client.post<LarkData<{ custom_field: TaskField }>>(path, {
                  ...data,
                  ...target
              });
        const { custom_field } = body!.data!;

        for (const body of targets)
            await this.client.post(`${this.baseURI}/${custom_field.guid}/add`, body);

        return custom_field;
    }
}
