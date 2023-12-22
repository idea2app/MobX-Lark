import { TranslationMap } from '../../type';

export type StringMap = Record<string, string>;

export interface TaskOperator {
    id: string;
    type: 'user' | 'app';
    role?: 'creator' | 'owner' | 'editor' | 'viewer' | 'assignee' | 'follower';
}

export interface TaskList
    extends Record<
        'guid' | 'name' | 'url' | 'created_at' | 'updated_at',
        string
    > {
    creator: TaskOperator;
    owner: TaskOperator;
    members: TaskOperator[];
}

export type TaskResourceType = 'tasklist' | 'my_tasks';

export interface TaskListSection
    extends Pick<
        TaskList,
        'guid' | 'name' | 'creator' | 'created_at' | 'updated_at'
    > {
    resource_type: TaskResourceType;
    is_default: boolean;
    tasklist: Pick<TaskList, 'guid' | 'name'>;
}

export interface TaskTimeEnd {
    timestamp: string;
    is_all_day?: boolean;
}

export interface TaskCompletion {
    href: string;
    tip: TranslationMap;
}

export type BaseTaskField = Pick<TaskList, 'guid' | 'name'> &
    Pick<TaskList, 'creator' | 'created_at' | 'updated_at'>;

export interface TaskFieldNumberSetting {
    format: 'normal' | 'percentage' | 'cny' | 'usd' | 'custom';
    custom_symbol?: string;
    custom_symbol_position?: 'left' | 'right';
    separator: 'none' | 'thousand';
    decimal_count: number;
}

export interface NumberTaskField extends BaseTaskField {
    type: 'number';
    number_setting: TaskFieldNumberSetting;
}

export interface TextTaskField extends BaseTaskField {
    type: 'text';
    text_setting: object;
}

export interface DateTimeTaskField extends BaseTaskField {
    type: 'datetime';
    datetime_setting: { format: string };
}

export interface TaskFieldOption extends Pick<TaskFieldValue, 'guid' | 'name'> {
    color_index: number;
    is_hidden: boolean;
}

export interface SingleSelectTaskField extends BaseTaskField {
    type: 'single_select';
    single_select_setting: { options: TaskFieldOption[] };
}

export interface MultiSelectTaskField extends BaseTaskField {
    type: 'multi_select';
    multi_select_setting: { options: TaskFieldOption[] };
}

export interface MemberTaskField extends BaseTaskField {
    type: 'member';
    member_setting: { multi: boolean };
}

export type TaskField =
    | NumberTaskField
    | TextTaskField
    | DateTimeTaskField
    | SingleSelectTaskField
    | MultiSelectTaskField
    | MemberTaskField;

export type TaskFieldValue = Pick<TaskField, 'guid' | 'type' | 'name'> &
    Partial<
        Record<
            `${Exclude<TaskField['type'], 'member' | 'multi_select'>}_value`,
            string
        > & {
            member_value: TaskOperator[];
            multi_select_value: string[];
        }
    >;

export interface TaskDependency {
    type: 'next';
    task_guid: string;
}

export interface TaskAttachment
    extends Pick<TaskList, 'guid' | 'name'>,
        Record<'file_token' | 'uploaded_at', string> {
    size: 62232;
    uploader: TaskOperator;
    is_cover: boolean;
    resource: { type: 'task'; id: string };
}

export interface Task
    extends TaskList,
        Record<
            | 'task_id'
            | 'summary'
            | 'description'
            | 'completed_at'
            | 'repeat_rule'
            | 'extra'
            | 'parent_task_guid',
            string
        >,
        Record<'mode' | 'source' | 'subtask_count', number> {
    status: 'todo';
    is_milestone: boolean;
    start: TaskTimeEnd;
    due: TaskTimeEnd;
    reminders: {
        id?: string;
        relative_fire_minute: number;
    }[];
    origin: {
        platform_i18n_name: TranslationMap;
        href: Record<'url' | 'title', string>;
    };
    custom_complete: Record<'pc' | 'ios' | 'android', TaskCompletion>;
    custom_fields: TaskFieldValue[];
    attachments: TaskAttachment[];
    dependencies: TaskDependency[];
    tasklists: Partial<Record<'tasklist_guid' | 'section_guid', string>>[];
}

export type TaskSummary = Pick<TaskList, 'guid'> &
    Pick<
        Task,
        | 'summary'
        | 'completed_at'
        | 'start'
        | 'due'
        | 'members'
        | 'subtask_count'
    >;
