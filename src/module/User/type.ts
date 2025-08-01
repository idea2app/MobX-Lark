import { TranslationMap } from '../../type';

export type UserIdType = `${'open' | 'union' | 'user'}_id`;

export type LocaleUser = Record<`${'' | 'en_'}name` | `${'' | 'enterprise_'}email`, string>;

export enum Gender {
    Secret = 0,
    Male = 1,
    Female = 2,
    Other = 3
}

export enum EmployeeType {
    Formal = 1,
    Intern = 2,
    Outsourced = 3,
    Labor = 4,
    Consultant = 5
}

export interface CustomAttribute {
    type: 'TEXT';
    id: string;
    value: Record<
        'name' | 'text' | `option_${'id' | 'value'}` | `${'' | 'pc_' | 'picture_'}url`,
        string
    > & {
        generic_user: { id: string; type: 1 };
    };
}

export interface DepartmentName {
    name: string;
    i18n_name: TranslationMap;
}

export interface Department {
    department_id: string;
    department_name: DepartmentName;
    department_path: {
        department_ids: string[];
        department_path_name: DepartmentName;
    };
}

export interface Order {
    department_id: string;
    user_order: number;
    department_order: number;
    is_primary_dept: boolean;
}

export interface SeatAssign
    extends Record<
        'subscription_id' | 'license_plan_key' | 'product_name' | `${'start' | 'end'}_time`,
        string
    > {
    i18n_name: TranslationMap;
}

export interface User
    extends LocaleUser,
        Record<
            | UserIdType
            | 'mobile'
            | 'employee_no'
            | 'nickname'
            | 'avatar_key'
            | 'geo'
            | 'country'
            | 'city'
            | 'work_station'
            | `job_${'family' | 'level'}_id`
            | 'job_title'
            | 'leader_user_id',
            string
        >,
        Record<'mobile_visible' | `is_${'tenant_manager' | 'frozen'}`, boolean>,
        Record<`${'department' | 'subscription' | 'dotted_line_leader_user'}_ids`, string[]> {
    gender: Gender;
    avatar: Record<`avatar_${72 | 240 | 640 | 'origin'}`, string>;
    status: Record<`is_${'frozen' | 'resigned' | 'activated' | 'exited' | 'unjoin'}`, boolean>;
    join_time: number;
    employee_type: EmployeeType;
    orders: Order[];
    custom_attrs: CustomAttribute[];
    assign_info: SeatAssign[];
    department_path: Department[];
}
