import { FC } from 'react';

import { Align, BlockType, FileBlock, IframeBlock, IframeComponentType, ImageBlock } from '../type';

export const IframeBlockComponent: FC<IframeBlock> = ({ iframe: { component } }) => (
    <iframe style={{ width: '100%', aspectRatio: '16/9' }} src={component.url} />
);

export const ImageBlockComponent: FC<ImageBlock> = ({
    image: { token, width, height, align, caption }
}) => (
    <figure
        style={{
            textAlign: align === Align.left ? 'left' : align === Align.right ? 'right' : 'center'
        }}
    >
        <img
            src={`drive/v1/medias/${token}/download`}
            style={{ width: width || '100%', height }}
            alt={caption?.content}
        />
        {caption?.content && <figcaption>{caption.content}</figcaption>}
    </figure>
);

export const FileBlockComponent: FC<FileBlock> = ({ file, ...props }) => (
    <figure>
        <IframeBlockComponent
            {...props}
            block_type={BlockType.iframe}
            iframe={{
                component: {
                    type: IframeComponentType.Undefined,
                    url: `drive/v1/medias/${file.token}/download`
                }
            }}
        />
        <figcaption>{file.name}</figcaption>
    </figure>
);
