import { formatSecondsInTime } from '@utils/timeUtils';
import { Subtitle } from 'backend/database/types';
import Image from 'next/image';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import FadeTransition from './FadeTransition';
import MaterialIcon from './MaterialIcon';
import MenuDropdown from './MenuDropDown';
import Slider from './Slider';

const getDefaultSubtitle = (subtitles: Array<Subtitle>) =>
  subtitles.length === 1
    ? subtitles[0].id
    : subtitles.find((subtitle) => subtitle.language === 'por')?.id;

interface PlayerButtonProps {
  className?: string;
  children: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const PlayerButton: React.FC<PlayerButtonProps> = ({
  className = '',
  onClick = () => {},
  children,
}) => {
  return (
    <button onClick={onClick} className="flex items-center justify-center">
      <MaterialIcon
        className={`${className} flex items-center text-white opacity-90 duration-200  ease-in-out hover:opacity-100`}
      >
        {children}
      </MaterialIcon>
    </button>
  );
};

interface VideoPlayerProps {
  videoUrl: string;
  coverImageBase64: string;
  episodeTitle: string;
  subtitles: Array<Subtitle>;
  previews: Array<string>;
  onNextEpisode: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  episodeTitle,
  coverImageBase64: coverImage,
  subtitles,
  previews,
  onNextEpisode,
}) => {
  const [currentSubtitleId, setCurrentSubtitleId] = useState(
    getDefaultSubtitle(subtitles)
  );
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [hoverTimeInSeconds, setHoverTimeInSeconds] = useState(0);
  const [duration, setDuration] = useState('0:00:00');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingVolumeSlider, setIsShowingVolumeSlider] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasMouseMoved, setHasMouseMoved] = useState(true);
  const video = useRef<HTMLVideoElement>(null);
  const videoPlayer = useRef<HTMLDivElement>(null);
  const onKeyUpHandlerRef = useRef<((event: KeyboardEvent) => void) | null>(
    null
  );
  const currentCursorTimeoutRef = useRef({} as NodeJS.Timeout);

  const formattedHoverTime = formatSecondsInTime(hoverTimeInSeconds);
  const formattedCurrentTime = formatSecondsInTime(currentTime);
  const hoverTimePercentage =
    (hoverTimeInSeconds * 100) / (video.current?.duration || 1);
  const shouldShowControls = hasMouseMoved || !isPlaying;
  const shouldShowSubtitleButton = subtitles.length > 0;
  const isMuted = volume === 0;
  const currentHoverPreview =
    hoverTimeInSeconds != null && previews[Math.floor(hoverTimeInSeconds / 10)];
  const currentHoverPreviewSrc =
    currentHoverPreview && `data:image/jpg;base64,${currentHoverPreview}`;

  const seekToTime = (timeInSeconds: number) => {
    video.current!.currentTime = timeInSeconds;
  };

  const forward = useCallback((seconds: number) => {
    seekToTime(video.current!.currentTime + seconds);
  }, []);

  const rewind = useCallback((seconds: number) => {
    seekToTime(video.current!.currentTime - seconds);
  }, []);

  const increaseVolume = useCallback(
    (amount: number) => {
      video.current!.volume = Math.min((volume + amount) / 100, 1);
    },
    [volume]
  );

  const decreaseVolume = useCallback(
    (amount: number) => {
      video.current!.volume = Math.max((volume - amount) / 100, 0);
    },
    [volume]
  );

  const onPlayToggleHandler = useCallback(() => {
    if (!video.current!.paused) {
      video.current!.pause();
    } else {
      video.current!.play();
    }
  }, []);

  const onDisableSubtitlesHandler = () => {
    Array.from(video.current!.textTracks).forEach(
      (textTrack) => (textTrack.mode = 'hidden')
    );
    setCurrentSubtitleId('');
  };

  const onSelectSubtitleHandler = (textTrackId: string) => {
    Array.from(video.current!.textTracks).forEach((textTrack) => {
      if (textTrack.id !== textTrackId) {
        textTrack.mode = 'hidden';
      } else {
        textTrack.mode = 'showing';
        setCurrentSubtitleId(textTrack.id);
      }
    });
  };

  const onMouseMoveHandler = () => {
    clearInterval(currentCursorTimeoutRef.current);
    if (!hasMouseMoved) {
      setHasMouseMoved(true);
    }
    currentCursorTimeoutRef.current = setTimeout(function () {
      setHasMouseMoved(false);
    }, 3500);
  };

  const onMouseLeaveHandler = () => {
    clearInterval(currentCursorTimeoutRef.current);
    setHasMouseMoved(false);
  };

  const onMuteToggleHandler = () => {
    if (video.current!.volume) {
      video.current!.volume = 0;
    } else {
      video.current!.volume = 1;
    }
  };

  const onFullscreenToggleHandler = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoPlayer.current!.requestFullscreen();
    }
  };

  const onFullscreenChangeHandler = () => {
    setIsFullscreen(Boolean(document.fullscreenElement));
  };

  const onLoadMetadataHandler = () => {
    const duration = formatSecondsInTime(video.current?.duration);
    setDuration(duration);
  };

  const toggleIsShowingVolumeSlider = () => {
    setIsShowingVolumeSlider(!isShowingVolumeSlider);
  };

  const onKeyUpHandler = useCallback(
    (event: KeyboardEvent) => {
      if (isFullscreen) {
        switch (event.code) {
          case 'Space':
            onPlayToggleHandler();
            break;
          case 'ArrowLeft':
            rewind(10);
            break;
          case 'ArrowRight':
            forward(10);
            break;
          case 'ArrowUp':
            increaseVolume(10);
            break;
          case 'ArrowDown':
            decreaseVolume(10);
            break;
          default:
            break;
        }
      }
    },
    [
      onPlayToggleHandler,
      increaseVolume,
      decreaseVolume,
      rewind,
      forward,
      isFullscreen,
    ]
  );

  const buildSubtitlesOptions = () => {
    const subtitles = Array<ReactNode>();

    const disableSubtitlesOption = (
      <button
        key="disable-option"
        className="overflow-hidden text-ellipsis whitespace-nowrap p-2 text-left font-semibold uppercase hover:bg-rose-700"
        onClick={onDisableSubtitlesHandler}
      >
        Disable
      </button>
    );

    subtitles.push(disableSubtitlesOption);

    if (video.current) {
      const items = Array.from(video.current!.textTracks).map((trackText) => {
        const isCurrentSubtitle = trackText.id === currentSubtitleId;
        const selectedClass = isCurrentSubtitle && 'bg-rose-700';
        return (
          <button
            key={trackText.id}
            onClick={() => onSelectSubtitleHandler(trackText.id)}
            className={`${selectedClass} overflow-hidden text-ellipsis whitespace-nowrap p-2 text-left font-semibold uppercase hover:bg-rose-600`}
          >
            {trackText.label}
          </button>
        );
      });
      subtitles.push(...items);
      return subtitles;
    }
    return subtitles;
  };

  const setDefaultSubtitle = () => {
    setCurrentSubtitleId(getDefaultSubtitle(subtitles));
  };

  const addFullscreenChangeListener = () => {
    document!.addEventListener('fullscreenchange', onFullscreenChangeHandler);
    return () => {
      document!.removeEventListener(
        'fullscreenchange',
        onFullscreenChangeHandler
      );
    };
  };

  const pauseAndLoadCurrentVideo = () => {
    setIsPlaying(false);
    video.current!.load();
    video.current!.volume = volume / 100;
  };

  const updateKeyUpHandler = () => {
    if (onKeyUpHandlerRef.current) {
      document!.removeEventListener('keyup', onKeyUpHandlerRef.current);
    }

    onKeyUpHandlerRef.current = onKeyUpHandler;
    document!.addEventListener('keyup', onKeyUpHandler);

    return () => {
      if (onKeyUpHandlerRef.current) {
        document!.removeEventListener('keyup', onKeyUpHandlerRef.current);
      }
    };
  };

  useEffect(addFullscreenChangeListener, []);

  useEffect(updateKeyUpHandler, [onKeyUpHandler]);

  useEffect(setDefaultSubtitle, [subtitles]);

  useEffect(pauseAndLoadCurrentVideo, [videoUrl]);

  return (
    <div
      className={`${!shouldShowControls && 'cursor-none'} relative`}
      ref={videoPlayer}
      onMouseMove={onMouseMoveHandler}
      onMouseLeave={onMouseLeaveHandler}
    >
      <video
        id="videoPlayer"
        key={videoUrl}
        className="h-full w-full"
        ref={video}
        poster={`data:image/png;base64,${coverImage}`}
        preload="auto"
        onClick={onPlayToggleHandler}
        onLoadedMetadata={onLoadMetadataHandler}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onVolumeChange={() => setVolume(video.current!.volume * 100)}
        onTimeUpdate={() => setCurrentTime(video.current?.currentTime!)}
      >
        <source src={videoUrl} type="video/mp4" />
        {subtitles.map((subtitle) => {
          const isSubtitleDefault = currentSubtitleId === subtitle.id;
          return (
            <track
              id={subtitle.id}
              key={subtitle.id}
              src={`/api/subtitle/vtt-file/${subtitle.id}`}
              srcLang={subtitle.language}
              label={subtitle.label}
              kind="subtitles"
              default={isSubtitleDefault}
            />
          );
        })}
      </video>
      <FadeTransition key="video-controls" show={shouldShowControls}>
        <div
          id="video-top-controls"
          className="absolute top-0  z-10 flex w-full flex-col bg-gradient-to-b from-neutral-800 to-transparent px-4 py-2"
        >
          <span className="text-xl">{episodeTitle}</span>
          <button
            className="select-none text-start text-sm font-semibold duration-200 ease-in-out hover:text-rose-600"
            onClick={() => onNextEpisode()}
          >
            Next Episode
          </button>
        </div>

        <div
          id="video-middle-controls"
          className="absolute left-0 right-0 top-0 bottom-0 m-auto flex select-none items-center justify-center gap-2"
        >
          <PlayerButton
            className="md-56 scale-75 rounded-full bg-neutral-900/25 p-2 md:scale-100"
            onClick={() => rewind(10)}
          >
            replay_10
          </PlayerButton>
          <PlayerButton
            className="md-72 scale-75 rounded-full bg-neutral-900/25 p-2 md:scale-100"
            onClick={onPlayToggleHandler}
          >
            {isPlaying ? 'pause' : 'play_arrow'}
          </PlayerButton>
          <PlayerButton
            className="md-56 scale-75 rounded-full bg-neutral-900/25 p-2 md:scale-100"
            onClick={() => forward(10)}
          >
            forward_10
          </PlayerButton>
        </div>

        <div
          id="video-bottom-controls"
          className="absolute bottom-0 flex w-full select-none flex-col gap-2 bg-gradient-to-t from-neutral-800 to-transparent px-4 py-2"
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <PlayerButton onClick={onPlayToggleHandler}>
                {isPlaying ? 'pause' : 'play_circle'}
              </PlayerButton>

              <div
                className="flex items-center gap-2"
                onMouseEnter={() => toggleIsShowingVolumeSlider()}
                onMouseLeave={() => toggleIsShowingVolumeSlider()}
              >
                <PlayerButton onClick={onMuteToggleHandler}>
                  {isMuted ? (
                    <i className="material-icons">volume_off</i>
                  ) : (
                    <i className="material-icons">volume_up</i>
                  )}
                </PlayerButton>
                <div
                  className={`flex w-[110px] items-center justify-center ${
                    !isShowingVolumeSlider && 'hidden'
                  }`}
                >
                  <Slider
                    value={volume}
                    onChange={(newVolume) => {
                      video.current!.volume = newVolume / 100;
                    }}
                    activeClassName="bg-neutral-50"
                    thumbClassName="bg-neutral-50"
                    alwaysShowThumb
                  />
                </div>
              </div>
              {shouldShowSubtitleButton && (
                <MenuDropdown
                  buttonClassName="flex items-center"
                  menuClassName="bottom-8 bg-neutral-900 opacity-90 w-[170px]"
                  items={buildSubtitlesOptions()}
                >
                  <PlayerButton>
                    <i className="material-icons">subtitles</i>
                  </PlayerButton>
                </MenuDropdown>
              )}
            </div>
            <PlayerButton onClick={onFullscreenToggleHandler}>
              <MaterialIcon>
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </MaterialIcon>
            </PlayerButton>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">
              {formattedCurrentTime}
            </span>
            <div className="group relative w-full">
              {currentHoverPreviewSrc && (
                <div
                  style={{
                    left: `calc(${hoverTimePercentage}% - 5.5rem)`,
                  }}
                  className="absolute -top-[8rem] hidden flex-col items-center gap-1 group-hover:flex"
                >
                  <figure className="w-44">
                    <Image
                      src={currentHoverPreviewSrc}
                      alt="Episode preview"
                      layout="responsive"
                      width={500}
                      height={281}
                    />
                  </figure>
                  <span className="text-sm">{formattedHoverTime}</span>
                </div>
              )}
              <Slider
                value={video.current?.currentTime}
                maxValue={video.current?.duration}
                onChange={(time) => seekToTime(time)}
                onHover={(time) => setHoverTimeInSeconds(time)}
                thumbClassName="bg-neutral-50"
              />
            </div>
            <span className="text-sm font-semibold">{duration}</span>
          </div>
        </div>
      </FadeTransition>
    </div>
  );
};

export default VideoPlayer;
