import { CSSProperties } from 'react';

import { FontColor, BackgroundColor } from '../type';

export const TextColorMap: Record<FontColor, CSSProperties['color']> = {
    [FontColor.Red]: 'red',
    [FontColor.Orange]: 'orange',
    [FontColor.Yellow]: 'yellow',
    [FontColor.Green]: 'green',
    [FontColor.Blue]: 'blue',
    [FontColor.Purple]: 'purple',
    [FontColor.Gray]: 'gray'
};

export const BackgroundColorMap: Record<BackgroundColor, CSSProperties['backgroundColor']> = {
    [BackgroundColor.LightRedBackground]: '#ffcccc',
    [BackgroundColor.LightOrangeBackground]: '#ffe6cc',
    [BackgroundColor.LightYellowBackground]: '#ffffcc',
    [BackgroundColor.LightGreenBackground]: '#e6ffe6',
    [BackgroundColor.LightBlueBackground]: '#cceeff',
    [BackgroundColor.LightPurpleBackground]: '#f2e6ff',
    [BackgroundColor.PaleGrayBackground]: '#f2f2f2',
    [BackgroundColor.DarkRedBackground]: 'red',
    [BackgroundColor.DarkOrangeBackground]: 'orange',
    [BackgroundColor.DarkYellowBackground]: 'yellow',
    [BackgroundColor.DarkGreenBackground]: 'green',
    [BackgroundColor.DarkBlueBackground]: 'blue',
    [BackgroundColor.DarkPurpleBackground]: 'purple',
    [BackgroundColor.DarkGrayBackground]: 'gray',
    [BackgroundColor.LightGrayBackground]: 'lightgray'
};
