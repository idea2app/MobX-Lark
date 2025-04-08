export interface LarkWikiNode
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
}
