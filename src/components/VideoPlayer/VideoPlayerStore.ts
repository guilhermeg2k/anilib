import { atom, useAtom } from 'jotai';
import { SubtitleConfig } from './types';

const currentSubtitleIdAtom = atom<string>('');
const volumeAtom = atom(50);
const currentTimeAtom = atom(0);
const hoverTimeInSecondsAtom = atom(0);
const durationAtom = atom('0:00:00');
const isPlayingAtom = atom(false);
const isShowingVolumeSliderAtom = atom(false);
const isFullscreenAtom = atom(false);
const isShowingControlsAtom = atom(false);
const subtitleConfigAtom = atom<SubtitleConfig>({
  color: 'white',
  background: 'black',
  size: 'small',
});
const videoAtom = atom<HTMLVideoElement | null>(null);

export const useVideoPlayerStore = () => {
  const [video, setVideo] = useAtom(videoAtom);
  const [duration, setDuration] = useAtom(durationAtom);
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
  const [volume, setVolume] = useAtom(volumeAtom);
  const [hoverTimeInSeconds, setHoverTimeInSeconds] = useAtom(
    hoverTimeInSecondsAtom
  );
  const [currentSubtitleId, setCurrentSubtitleId] = useAtom(
    currentSubtitleIdAtom
  );
  const [subtitleConfig, setSubtitleConfig] = useAtom(subtitleConfigAtom);
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const [isFullscreen, setIsFullscreen] = useAtom(isFullscreenAtom);
  const [isShowingVolumeSlider, setIsShowingVolumeSlider] = useAtom(
    isShowingVolumeSliderAtom
  );
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
    hoverTimeInSeconds,
    setHoverTimeInSeconds,
    currentSubtitleId,
    setCurrentSubtitleId,
    subtitleConfig,
    setSubtitleConfig,
    isPlaying,
    setIsPlaying,
    isFullscreen,
    setIsFullscreen,
    isShowingVolumeSlider,
    setIsShowingVolumeSlider,
    isShowingControls,
    setIsShowingControls,
  };
};
