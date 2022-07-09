import Slider from '@components/core/Slider';

import PauseIconOutlined from '@heroicons/react/outline/PauseIcon';
import PlayIconOutlined from '@heroicons/react/outline/PlayIcon';
import {
  AnnotationIcon,
  ArrowsExpandIcon,
  CogIcon,
  PauseIcon,
  PlayIcon,
  VolumeOffIcon,
  VolumeUpIcon,
} from '@heroicons/react/solid';
import useEffectIf from 'hooks/useEffectIf';
import React, {
  FunctionComponent,
  KeyboardEvent,
  ReactNode,
  useRef,
  useState,
} from 'react';
import { text } from 'stream/consumers';
import FadeTransition from './FadeTransition';
import MenuDropdown from './MenuDropDown';

const formatTime = (timeInSeconds: number | undefined) => {
  if (timeInSeconds) {
    if (timeInSeconds < 3600) {
      const formattedTime = new Date(timeInSeconds * 1000)
        .toISOString()
        .slice(14, 19);
      return formattedTime;
    }
    const formattedTime = new Date(timeInSeconds * 1000)
      .toISOString()
      .slice(11, 19);
    return formattedTime;
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
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldShowControls, setShouldShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoPlayerRef = useRef<HTMLDivElement>(null);
  const currentCursorTimeoutRef = useRef({} as NodeJS.Timeout);

  const video = videoRef.current;
  const videoPlayer = videoPlayerRef.current;
  const isMuted = volume === 0;
  const isMaxVolume = volume === 100;
  const isOnStart = currentTime === 0;
  const duration = formatTime(video?.duration);
  const videoCurrentTime = formatTime(video?.currentTime);

  const seekToTime = (timeInSeconds: number) => {
    if (video) {
      video.currentTime = timeInSeconds;
    }
  };

  const updateCurrentTime = () => {
    if (video) {
      const currentTime = (video?.currentTime * 100) / video?.duration;
      setCurrentTime(currentTime);
    }
  };

  const onDisableSubtitlesHandler = () => {
    if (video) {
      Array.from(video.textTracks).forEach(
        (textTrack) => (textTrack.mode = 'hidden')
      );
    }
  };

  const onToggleSubtitleHandler = (textTrackId: string) => {
    if (video) {
      Array.from(video.textTracks).forEach((textTrack) => {
        if (textTrack.id !== textTrackId) {
          textTrack.mode = 'hidden';
        } else {
          textTrack.mode = 'showing';
        }
      });
    }
  };

  const onPlayToggleHandler = () => {
    setIsPlaying(!isPlaying);
  };

  const onTimeChangeHandler = (time: number) => {
    if (video && time < 100) {
      const currentTimeOnSeconds = (video.duration * time) / 100;
      seekToTime(currentTimeOnSeconds);
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

  const onVideoKeyUpHandler = (event: KeyboardEvent) => {
    event.preventDefault();
    switch (event.code) {
      case 'Space':
        onPlayToggleHandler();
        break;
      case 'ArrowLeft':
        if (video) {
          seekToTime(video?.currentTime - 10);
        }
      case 'ArrowRight':
        if (video) {
          seekToTime(video?.currentTime + 10);
        }
      default:
        break;
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
    <button
      className="absolute m-auto left-0 right-0 top-0 bottom-0 w-28 h-28 opacity-90 hover:opacity-100 duration-200 ease-in-out"
      onClick={onPlayToggleHandler}
    >
      {isPlaying ? (
        <FadeTransition show={shouldShowControls}>
          <PauseIconOutlined className="h-full w-full" />
        </FadeTransition>
      ) : (
        <FadeTransition show={!isPlaying}>
          <PlayIconOutlined className="h-full w-full" />
        </FadeTransition>
      )}
    </button>
  );

  const playButtonControl = (
    <PlayerButton onClick={onPlayToggleHandler}>
      {isPlaying ? (
        <PauseIcon className="h-8 w-8" />
      ) : (
        <PlayIcon className="h-8 w-8" />
      )}
    </PlayerButton>
  );

  const timeBarControl = (
    <>
      <Slider
        className={`${isOnStart && 'pl-2'} w-full`}
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

  const buildSubtitlesOptions = () => {
    const subtitles = Array<ReactNode>();
    const disableSubtitlesOption = (
      <button
        className="text-left p-2 font-semibold uppercase hover:bg-rose-700"
        onClick={onDisableSubtitlesHandler}
      >
        Disable
      </button>
    );
    subtitles.push(disableSubtitlesOption);

    if (video) {
      const items = Array.from(video.textTracks).map((trackText) => (
        <button
          key={trackText.id}
          onClick={() => onToggleSubtitleHandler(trackText.id)}
          className="text-left p-2 font-semibold uppercase hover:bg-rose-700"
        >
          {trackText.label}
        </button>
      ));
      subtitles.push(...items);
      return subtitles;
    }

    return subtitles;
  };

  useEffectIf(
    () => {
      if (isPlaying) {
        video!.play();
      } else {
        video!.pause();
      }
    },
    Boolean(video),
    [isPlaying, video]
  );

  useEffectIf(
    () => {
      video!.volume = volume / 100;
    },
    Boolean(video),
    [volume, video]
  );

  useEffectIf(
    () => video?.addEventListener('timeupdate', updateCurrentTime),
    Boolean(video),
    [video]
  );

  return (
    <div
      className={`${!shouldShowControls && 'cursor-none'} relative`}
      ref={videoPlayerRef}
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
        <source src="/api/video" type="video/mp4" />
        <track
          src="/api/vtt"
          srcLang="en"
          label="English"
          kind="subtitles"
          default
        />
      </video>
      {playButton}
      <FadeTransition show={shouldShowControls}>
        <div className="h-9 bg-neutral-900 opacity-90 absolute bottom-0 w-full flex items-center gap-2 px-2">
          {playButtonControl}
          {timeBarControl}
          {volumeControl}
          <MenuDropdown
            buttonClassName="flex items-center"
            menuClassName="bottom-8 bg-neutral-900 opacity-90"
            items={buildSubtitlesOptions()}
          >
            <PlayerButton>
              <AnnotationIcon className="h-5 w-5" />
            </PlayerButton>
          </MenuDropdown>

          <PlayerButton>
            <CogIcon className="h-5 w-5" />
          </PlayerButton>
          <PlayerButton onClick={onFullscreenToggleHandler}>
            <ArrowsExpandIcon className="h-5 w-5" />
          </PlayerButton>
        </div>
      </FadeTransition>
    </div>
  );
};

export default VideoPlayer;
