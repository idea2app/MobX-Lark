export interface LarkWiki
    extends Record<'name' | ' description' | 'space_id', string> {
    space_type: 'team' | 'person' | 'my_library';
    visibility: 'public' | 'private';
    open_sharing: 'open' | 'closed';
}

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
