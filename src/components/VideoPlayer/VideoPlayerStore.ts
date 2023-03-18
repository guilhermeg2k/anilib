import { atom, useAtom } from 'jotai';
import { SubtitleConfig } from './types';

const videoAtom = atom<HTMLVideoElement | null>(null);
const volumeAtom = atom(50);
const currentTimeAtom = atom(0);
const durationAtom = atom(0);
const currentSubtitleIdAtom = atom<string>('');
const isPlayingAtom = atom(false);
const isFullscreenAtom = atom(false);
const isShowingControlsAtom = atom(false);
const subtitleConfigAtom = atom<SubtitleConfig>({
  color: 'white',
  background: 'black',
  size: 'small',
});

export const useVideoPlayerStore = () => {
  const [video, setVideo] = useAtom(videoAtom);
  const [duration, setDuration] = useAtom(durationAtom);
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
  const [volume, setVolume] = useAtom(volumeAtom);
  const [currentSubtitleId, setCurrentSubtitleId] = useAtom(
    currentSubtitleIdAtom
  );
  const [subtitleConfig, setSubtitleConfig] = useAtom(subtitleConfigAtom);
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const [isFullscreen, setIsFullscreen] = useAtom(isFullscreenAtom);
  const [isShowingControls, setIsShowingControls] = useAtom(
    isShowingControlsAtom
  );

  return {
    video,
    setVideo,
    duration,
    setDuration,
    currentTime,
    setCurrentTime,
    volume,
    setVolume,
    currentSubtitleId,
    setCurrentSubtitleId,
    subtitleConfig,
    setSubtitleConfig,
    isPlaying,
    setIsPlaying,
    isFullscreen,
    setIsFullscreen,
    isShowingControls,
    setIsShowingControls,
  };
};
