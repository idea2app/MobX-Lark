/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#e8ce4e8e}
 */
export enum BlockType {
    /**
     * 页面 Block
     */
    page = 1,
    /**
     * 文本 Block
     */
    text = 2,
    /**
     * 标题 1 Block
     */
    heading1 = 3,
    /**
     * 标题 2 Block
     */
    heading2 = 4,
    /**
     * 标题 3 Block
     */
    heading3 = 5,
    /**
     * 标题 4 Block
     */
    heading4 = 6,
    /**
     * 标题 5 Block
     */
    heading5 = 7,
    /**
     * 标题 6 Block
     */
    heading6 = 8,
    /**
     * 标题 7 Block
     */
    heading7 = 9,
    /**
     * 标题 8 Block
     */
    heading8 = 10,
    /**
     * 标题 9 Block
     */
    heading9 = 11,
    /**
     * 无序列表 Block
     */
    bullet = 12,
    /**
     * 有序列表 Block
     */
    ordered = 13,
    /**
     * 代码块 Block
     */
    code = 14,
    /**
     * 引用 Block
     */
    quote = 15,
    /**
     * 待办事项 Block
     */
    todo = 17,
    /**
     * 多维表格 Block
     */
    bitable = 18,
    /**
     * 高亮块 Block
     */
    callout = 19,
    /**
     * 会话卡片 Block
     */
    chat_card = 20,
    /**
     * 流程图 & UML Block
     */
    diagram = 21,
    /**
     * 分割线 Block
     */
    divider = 22,
    /**
     * 文件 Block
     */
    file = 23,
    /**
     * 分栏 Block
     */
    grid = 24,
    /**
     * 分栏列 Block
     */
    grid_column = 25,
    /**
     * 内嵌 Block Block
     */
    iframe = 26,
    /**
     * 图片 Block
     */
    image = 27,
    /**
     * 开放平台小组件 Block
     */
    isv = 28,
    /**
     * 思维笔记 Block
     */
    mindnote = 29,
    /**
     * 电子表格 Block
     */
    sheet = 30,
    /**
     * 表格 Block
     */
    table = 31,
    /**
     * 表格单元格 Block
     */
    table_cell = 32,
    /**
     * 视图 Block
     */
    view = 33,
    /**
     * 引用容器 Block
     */
    quote_container = 34,
    /**
     * 任务 Block
     */
    task = 35,
    /**
     * OKR Block
     */
    okr = 36,
    /**
     * OKR Objective Block
     */
    okr_objective = 37,
    /**
     * OKR Key Result Block
     */
    okr_key_result = 38,
    /**
     * OKR Progress Block
     */
    okr_progress = 39,
    /**
     * 新版文档小组件 Block
     */
    add_ons = 40,
    /**
     * Jira 问题 Block
     */
    jira_issue = 41,
    /**
     * Wiki 子页面列表 Block（旧版）
     */
    wiki_catalog = 42,
    /**
     * 画板 Block
     */
    board = 43,
    /**
     * 议程 Block
     */
    agenda = 44,
    /**
     * 议程项 Block
     */
    agenda_item = 45,
    /**
     * 议程项标题 Block
     */
    agenda_item_title = 46,
    /**
     * 议程项内容 Block
     */
    agenda_item_content = 47,
    /**
     * 链接预览 Block
     */
    link_preview = 48,
    /**
     * 源同步块
     */
    source_synced = 49,
    /**
     * 引用同步块
     */
    reference_synced = 50,
    /**
     * Wiki 子页面列表 Block（新版）
     */
    sub_page_list = 51,
    /**
     * AI 模板 Block
     */
    ai_template = 52,
    /**
     * 未支持 Block
     */
    undefined = 999
}

/**
 * @see {@link https://open.feishu.cn/document/docs/docs/data-structure/block#8b7f3e74}
 */
export type Block<Type extends BlockType, TypeName extends keyof typeof BlockType, Meta = {}> = {
    block_id: string;
    block_type: Type;
    parent_id?: string;
    children?: string[];
    comment_ids?: string[];
} & {
    [type in TypeName]: Meta;
};
