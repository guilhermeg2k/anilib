import Slider from '@components/core/Slider';
import { Transition } from '@headlessui/react';

import {
  AnnotationIcon,
  ArrowsExpandIcon,
  CogIcon,
  PauseIcon,
  PlayIcon,
  VolumeOffIcon,
  VolumeUpIcon,
} from '@heroicons/react/solid';
import {
  Fragment,
  FunctionComponent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

const useVideoEffect = (
  effect: () => void,
  video: HTMLVideoElement | null,
  deps: Array<any>
) => {
  useEffect(() => {
    if (video) {
      effect();
    }
  }, [deps, effect, video]);
};

const formatTime = (timeInSeconds: number | undefined) => {
  if (timeInSeconds) {
    const date = new Date(timeInSeconds * 1000);
    console.log(date, 'diso');
    const minutes = date.getMinutes().toString();
    const seconds = date.getSeconds().toString();
    return `${minutes}:${seconds}`;
  }
  return '00:00';
};

interface PlayerButtonProps {
  className?: string;
  children: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const PlayerButton: FunctionComponent<PlayerButtonProps> = ({
  className = '',
  onClick,
  children,
}) => {
  return (
    <button
      className={`${className} text-neutral-300 hover:text-white duration-200 ease-in-out`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

interface VideoPlayerProps {}

const VideoPlayer: FunctionComponent<VideoPlayerProps> = () => {
  const [volume, setVolume] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [shouldShowControls, setShouldShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const currentCursorTimeoutRef = useRef({} as NodeJS.Timeout);
  const video = videoRef.current;
  const videoPlayer = videoContainerRef.current;
  const isMuted = volume === 0;
  const isMaxVolume = volume === 100;
  const duration = formatTime(video?.duration);
  const videoCurrentTime = formatTime(video?.currentTime);

  const onPlayToggleHandler = () => {
    setIsPlaying(!isPlaying);
  };

  const onTimeChangeHandler = (time: number) => {
    if (video && time < 100) {
      const currentTimeOnSeconds = (video.duration * time) / 100;
      video.currentTime = currentTimeOnSeconds;
    }
  };

  const onVideoMouseLeaveHandler = () => {
    setShouldShowControls(false);
  };

  const onVideoMouseEnterHandler = () => {
    setShouldShowControls(true);
  };

  const onVideoMouseMoveHandler = () => {
    clearInterval(currentCursorTimeoutRef.current);
    if (!shouldShowControls) {
      setShouldShowControls(true);
    }
    currentCursorTimeoutRef.current = setTimeout(function () {
      setShouldShowControls(false);
    }, 3500);
  };

  const onVideoKeyUpHandler = (event) => {};

  const updateCurrentTime = () => {
    if (video) {
      const currentTime = (video?.currentTime * 100) / video?.duration;
      setCurrentTime(currentTime);
    }
  };

  const onVolumeChangeHandler = (newVolume: number) => {
    setVolume(newVolume);
  };

  const onMuteToggleHandler = () => {
    if (volume === 0) {
      setVolume(100);
    } else {
      setVolume(0);
    }
  };

  const onFullscreenToggleHandler = () => {
    if (video && document) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (document.webkitFullscreenElement) {
        document.webkitExitFullscreen();
      } else {
        videoPlayer!.requestFullscreen();
      }
    }
  };

  const playButton = (
    <PlayerButton onClick={onPlayToggleHandler}>
      {isPlaying ? (
        <PauseIcon className="h-8 w-8" />
      ) : (
        <PlayIcon className="h-8 w-8" />
      )}
    </PlayerButton>
  );

  const timeBar = (
    <>
      <Slider
        className="w-full"
        value={currentTime}
        onChange={onTimeChangeHandler}
      />
      <span className="text-sm">
        {videoCurrentTime}/{duration}
      </span>
    </>
  );

  const volumeControl = (
    <div className="flex gap-1 w-[150px] items-center">
      <PlayerButton onClick={onMuteToggleHandler}>
        {isMuted ? (
          <VolumeOffIcon className="h-5 w-5" />
        ) : (
          <VolumeUpIcon className="h-5 w-5" />
        )}
      </PlayerButton>
      <Slider
        className={`w-full ${isMuted && 'pl-2'} ${isMaxVolume && 'pr-2'}`}
        value={volume}
        onChange={onVolumeChangeHandler}
      />
    </div>
  );

  useVideoEffect(
    () => {
      if (isPlaying) {
        video!.play();
      } else {
        video!.pause();
      }
    },
    video,
    [isPlaying, video]
  );

  useVideoEffect(
    () => {
      video!.volume = volume / 100;
    },
    video,
    [volume, video]
  );

  useVideoEffect(
    () => video?.addEventListener('timeupdate', updateCurrentTime),
    video,
    [video]
  );

  return (
    <div
      className={`${!shouldShowControls && 'cursor-none'} relative`}
      ref={videoContainerRef}
      onMouseLeave={onVideoMouseLeaveHandler}
      onMouseEnter={onVideoMouseEnterHandler}
      onMouseMove={onVideoMouseMoveHandler}
      onKeyUp={onVideoKeyUpHandler}
    >
      <video
        id="videoPlayer"
        className="w-full"
        ref={videoRef}
        height="100%"
        onClick={onPlayToggleHandler}
      >
        <source src="http://192.168.1.2:3000/api/video" type="video/mp4" />
        <track
          src="http://192.168.1.2:3000/api/vtt"
          srcLang="en"
          label="English"
          kind="subtitles"
          default
        />
      </video>
      <Transition appear show={shouldShowControls} as={Fragment}>
        <Transition.Child
          enter="ease-in duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="h-9 bg-neutral-900 opacity-90 absolute bottom-0 w-full flex items-center gap-2 px-2">
            {playButton}
            {timeBar}
            {volumeControl}
            <PlayerButton>
              <AnnotationIcon className="h-5 w-5" />
            </PlayerButton>
            <PlayerButton>
              <CogIcon className="h-5 w-5" />
            </PlayerButton>
            <PlayerButton onClick={onFullscreenToggleHandler}>
              <ArrowsExpandIcon className="h-5 w-5" />
            </PlayerButton>
          </div>
        </Transition.Child>
      </Transition>
    </div>
  );
};

export default VideoPlayer;
