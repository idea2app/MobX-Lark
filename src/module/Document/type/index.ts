export * from './Block';
export * from './Text';
export * from './Layout';
export * from './Media';
export * from './Document';
export * from './Collaboration';

export interface Document extends Record<'document_id' | 'title', string> {
    revision_id: number;
    cover: Record<`offset_ratio_${'x' | 'y'}`, number> & { token: string };
    display_setting: Record<
        `show_${'authors' | `${'comment' | 'like'}_count` | 'create_time' | 'pv' | 'uv'}`,
        boolean
    >;
}
