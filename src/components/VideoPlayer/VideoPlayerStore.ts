import { atom } from 'jotai';
import { SubtitleConfig } from './types';

export const currentSubtitleIdAtom = atom<string>('');
export const volumeAtom = atom(50);
export const currentTimeAtom = atom(0);
export const hoverTimeInSecondsAtom = atom(0);
export const durationAtom = atom('0:00:00');
export const isPlayingAtom = atom(false);
export const isShowingVolumeSliderAtom = atom(false);
export const isFullscreenAtom = atom(false);
export const hasMouseMovedAtom = atom(true);
export const subtitleConfigAtom = atom<SubtitleConfig>({
  color: 'white',
  background: 'black',
  size: 'small',
});
export const videoAtom = atom<HTMLVideoElement | null>(null);
