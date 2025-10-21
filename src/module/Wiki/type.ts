export interface Wiki extends Record<'name' | ' description' | 'space_id', string> {
    space_type: 'team' | 'person' | 'my_library';
    visibility: 'public' | 'private';
    open_sharing: 'open' | 'closed';
}

export interface WikiNode
    extends Record<
        | 'title'
        | 'creator'
        | 'owner'
        | `${'' | 'origin_'}space_id`
        | `node_create_time`
        | `${'' | 'parent_' | 'origin_'}node_token`
        | `obj_token`
        | `obj_${'create' | 'edit'}_time`,
        string
    > {
    node_type: 'origin' | 'shortcut';
    obj_type: `doc${'' | 'x'}` | 'sheet' | 'mindnote' | 'bitable' | 'file';
    has_child: boolean;
    /**
     * MobX-Lark custom property for Async Iteration
     */
    title_path?: string;
}

export interface WikiTask {
    task_id: string;
    move_result: { status: number; status_msg: string; node: WikiNode }[];
}
