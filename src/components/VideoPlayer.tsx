import { Popover, Tab, Transition } from '@headlessui/react';
import { formatSecondsInTime } from '@utils/timeUtils';
import { Subtitle as Subtitles } from 'backend/database/types';
import { clsx } from 'clsx';
import { useCueChange } from 'hooks/useCueChange';
import Image from 'next/image';
import React, {
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import FadeTransition from './FadeTransition';
import MaterialIcon from './MaterialIcon';
import Slider from './Slider';

type VideoPlayerProps = {
  videoUrl: string;
  coverImageBase64: string;
  episodeTitle: string;
  subtitles: Array<Subtitles>;
  previews: Array<string>;
  onNextEpisode: () => void;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
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
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [hoverTimeInSeconds, setHoverTimeInSeconds] = useState(0);
  const [duration, setDuration] = useState('0:00:00');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingVolumeSlider, setIsShowingVolumeSlider] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasMouseMoved, setHasMouseMoved] = useState(true);
  const [subtitleConfig, setSubtitleConfig] = useState({
    color: 'white',
    background: 'black',
    size: 'small',
  } as SubtitleConfig);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const videoPlayerDiv = useRef<HTMLDivElement>(null);
  const onKeyUpHandlerRef = useRef<((event: KeyboardEvent) => void) | null>(
    null
  );
  const currentCursorTimeoutRef = useRef({} as NodeJS.Timeout);

  const formattedHoverTime = formatSecondsInTime(hoverTimeInSeconds);
  const formattedCurrentTime = formatSecondsInTime(currentTime);
  const hoverTimePercentage =
    (hoverTimeInSeconds * 100) / (video?.duration || 1);
  const shouldShowControls = hasMouseMoved || !isPlaying;
  const shouldShowSubtitleButton = subtitles.length > 0;
  const isMuted = volume === 0;
  const currentHoverPreview =
    hoverTimeInSeconds != null && previews[Math.floor(hoverTimeInSeconds / 10)];
  const currentHoverPreviewSrc =
    currentHoverPreview && `data:image/jpg;base64,${currentHoverPreview}`;

  const seekToTime = (timeInSeconds: number) => {
    video!.currentTime = timeInSeconds;
  };

  const forward = useCallback((seconds: number) => {
    seekToTime(video!.currentTime + seconds);
  }, []);

  const rewind = useCallback(
    (seconds: number) => {
      seekToTime(video!.currentTime - seconds);
    },
    [video]
  );

  const increaseVolume = useCallback(
    (amount: number) => {
      video!.volume = Math.min((volume + amount) / 100, 1);
    },
    [volume, video]
  );

  const decreaseVolume = useCallback(
    (amount: number) => {
      video!.volume = Math.max((volume - amount) / 100, 0);
    },
    [volume, video]
  );

  const onPlayToggleHandler = useCallback(() => {
    if (!video!.paused) {
      video!.pause();
    } else {
      video!.play();
    }
  }, [video]);

  const onDisableSubtitlesHandler = () => {
    Array.from(video!.textTracks).forEach(
      (textTrack) => (textTrack.mode = 'hidden')
    );
    setCurrentSubtitleId('');
  };

  const onChangeSubtitleHandler = (textTrackId: string) => {
    Array.from(video!.textTracks).forEach((textTrack) => {
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
    if (video!.volume) {
      video!.volume = 0;
    } else {
      video!.volume = 1;
    }
  };

  const onFullscreenToggleHandler = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoPlayerDiv.current!.requestFullscreen();
    }
  };

  const onFullscreenChangeHandler = () => {
    setIsFullscreen(Boolean(document.fullscreenElement));
  };

  const onLoadMetadataHandler = () => {
    const duration = formatSecondsInTime(video?.duration);
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
    if (video) {
      setIsPlaying(false);
      video.load();
      video.volume = volume / 100;
    }
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
      ref={videoPlayerDiv}
      onMouseMove={onMouseMoveHandler}
      onMouseLeave={onMouseLeaveHandler}
    >
      <video
        id="videoPlayer"
        key={videoUrl}
        className="h-full w-full"
        ref={(video) => {
          setVideo(video);
        }}
        poster={`data:image/png;base64,${coverImage}`}
        preload="auto"
        onClick={onPlayToggleHandler}
        onLoadedMetadata={onLoadMetadataHandler}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onVolumeChange={() => setVolume(video!.volume * 100)}
        onTimeUpdate={() => setCurrentTime(video?.currentTime!)}
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
      <Subtitles
        video={video}
        background={subtitleConfig.background}
        color={subtitleConfig.color}
        size={subtitleConfig.size}
        activeCueId={currentSubtitleId}
        isShowingControls={shouldShowControls}
      />
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
                      video!.volume = newVolume / 100;
                    }}
                    activeClassName="bg-neutral-50"
                    thumbClassName="bg-neutral-50"
                    alwaysShowThumb
                  />
                </div>
              </div>
              {shouldShowSubtitleButton && (
                <SubtitleButton
                  video={video}
                  currentSubtitleId={currentSubtitleId}
                  config={subtitleConfig}
                  onChangeSubtitle={onChangeSubtitleHandler}
                  onDisableSubtitles={onDisableSubtitlesHandler}
                  onConfigChange={(config: SubtitleConfig) =>
                    setSubtitleConfig(config)
                  }
                />
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
                value={video?.currentTime}
                maxValue={video?.duration}
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

const getDefaultSubtitle = (subtitles: Array<Subtitles>) =>
  subtitles.length === 1
    ? subtitles[0].id
    : subtitles.find((subtitle) => subtitle.language === 'por')?.id;

type SubtitleColor = 'white' | 'yellow';

type SubtitleBackground = 'black' | 'transparent';

type SubtitleSize = 'small' | 'medium' | 'large';

type SubtitleConfig = {
  color: SubtitleColor;
  background: SubtitleBackground;
  size: SubtitleSize;
};

type PlayerButtonProps = {
  className?: string;
  children: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

const buildSubtitleColor = (color: SubtitleColor) => {
  switch (color) {
    case 'white':
      return 'text-white-300';
    case 'yellow':
      return 'text-amber-300';
  }
};

const buildBackgroundColor = (background: SubtitleBackground) => {
  switch (background) {
    case 'black':
      return 'bg-[rgba(1,1,1,0.6)] ';
    case 'transparent':
      return 'bg-transparent';
  }
};

const buildSize = (size: SubtitleSize) => {
  switch (size) {
    case 'small':
      return 'text-2xl';
    case 'medium':
      return 'text-4xl';
    case 'large':
      return 'text-6xl';
  }
};

const buildSubtitleTextClass = (color: SubtitleColor, size: SubtitleSize) => {
  const colorClass = buildSubtitleColor(color);
  const sizeClass = buildSize(size);

  return `${colorClass} ${sizeClass}`;
};

type SubtitleProps = {
  color: SubtitleColor;
  background: SubtitleBackground;
  size: SubtitleSize;
  video: HTMLVideoElement | null;
  activeCueId: string | undefined;
  isShowingControls: boolean;
};

const Subtitles = ({
  color,
  background,
  size,
  video,
  activeCueId,
  isShowingControls,
}: SubtitleProps) => {
  const [activeCues, setActiveCues] = useState<TextTrackCue[] | never[]>([]);

  const currentTextTrack = useMemo(() => {
    if (video && activeCueId) {
      return Array.from(video.textTracks).find(
        (textTrack) => textTrack.id === activeCueId
      );
    }
  }, [video, activeCueId]);

  const onCueChangeHandler = useCallback(() => {
    const cues = currentTextTrack?.activeCues || [];
    setActiveCues(Array.from(cues));
  }, [currentTextTrack?.activeCues]);

  const textClassName = buildSubtitleTextClass(color, size);
  const backgroundClassName = buildBackgroundColor(background);

  useCueChange(currentTextTrack, onCueChangeHandler);

  return (
    <div
      className={`absolute ${
        isShowingControls ? 'bottom-16' : 'bottom-5'
      } flex w-full select-none flex-col items-center gap-2   px-4 py-2`}
    >
      <div className={`px-4 py-1 ${backgroundClassName}`}>
        {activeCues.map((cue) => {
          return (
            <div
              key={`${cue.startTime}-${cue.endTime}-${cue.text}`}
              style={{
                textShadow:
                  '#000 0px 0px 3px, #000 0px 0px 3px, #000 0px 0px 3px, #000 0px 0px 3px, #000 0px 0px 3px, #000 0px 0px 3px',
                fontFamily: 'Arial, Helvetica, sans-serif',
              }}
              className={`${textClassName} text-center font-bold antialiased`}
            >
              {cue.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};

type SubtitleButtonProps = {
  video: HTMLVideoElement | null;
  currentSubtitleId: string | undefined;
  config: SubtitleConfig;
  onChangeSubtitle: (subtitleId: string) => void;
  onDisableSubtitles: () => void;
  onConfigChange: (config: SubtitleConfig) => void;
};

const SubtitleButton = ({
  video,
  currentSubtitleId,
  onChangeSubtitle,
  onDisableSubtitles,
  config,
  onConfigChange,
}: SubtitleButtonProps) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const { color, background, size } = config;

  const changeTextColor = (color: SubtitleColor) => {
    onConfigChange({ ...config, color });
  };

  const changeBackgroundColor = (background: SubtitleBackground) => {
    onConfigChange({ ...config, background });
  };

  const changeSize = (size: SubtitleSize) => {
    onConfigChange({ ...config, size });
  };

  const buildSubtitlesOptions = () => {
    const subtitles = Array<ReactNode>();

    const disableSubtitlesOption = (
      <button
        key="disable-option"
        className="overflow-hidden text-ellipsis whitespace-nowrap text-left font-semibold uppercase hover:text-rose-700"
        onClick={onDisableSubtitles}
      >
        Disabled
      </button>
    );

    subtitles.push(disableSubtitlesOption);

    if (video) {
      const items = Array.from(video.textTracks).map((trackText) => {
        const isCurrentSubtitle = trackText.id === currentSubtitleId;
        const optionTextColor = isCurrentSubtitle
          ? 'text-white'
          : 'text-neutral-400';

        return (
          <button
            key={trackText.id}
            onClick={() => onChangeSubtitle(trackText.id)}
            className={`${optionTextColor} mb-1 overflow-hidden text-ellipsis whitespace-nowrap text-left font-semibold uppercase  hover:text-rose-700`}
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

  return (
    <Popover className="relative flex ">
      <Popover.Button>
        <PlayerButton>
          <i className="material-icons">subtitles</i>
        </PlayerButton>
      </Popover.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Popover.Panel className="absolute bottom-8 z-50 w-[250px] origin-top-left flex-col rounded-sm bg-neutral-900 p-2 text-sm opacity-90 shadow-md">
          <Tab.Group
            onChange={(index) => setSelectedTab(index)}
            selectedIndex={selectedTab}
          >
            <Tab.List className="grid grid-cols-2 gap-2">
              <Tab
                className={clsx(
                  'rounded-sm p-1 px-4 font-semibold uppercase',
                  selectedTab === 0 && 'bg-neutral-700'
                )}
              >
                Language
              </Tab>
              <Tab
                className={clsx(
                  'rounded-sm p-1 px-4 font-semibold uppercase',
                  selectedTab === 1 && 'bg-neutral-700'
                )}
              >
                Settings
              </Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                <div className="flex flex-col py-2">
                  {buildSubtitlesOptions()}
                </div>
              </Tab.Panel>

              <Tab.Panel>
                <div className="flex flex-col gap-2 py-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold">Text Color</span>
                    <div className="flex gap-5">
                      <button
                        className={clsx(
                          'rounded-sm p-1',
                          color === 'white' && 'bg-neutral-700'
                        )}
                        onClick={() => changeTextColor('white')}
                      >
                        White
                      </button>
                      <button
                        className={clsx(
                          'rounded-sm p-1 text-amber-300',
                          color === 'yellow' && 'bg-neutral-700'
                        )}
                        onClick={() => changeTextColor('yellow')}
                      >
                        Yellow
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold">Text Size</span>
                    <div className="flex gap-5">
                      <button
                        className={clsx(
                          'text rounded-sm p-1 px-4',
                          size === 'small' && 'bg-neutral-700'
                        )}
                        onClick={() => changeSize('small')}
                      >
                        Aa
                      </button>
                      <button
                        className={clsx(
                          'rounded-sm p-1 px-4 text-2xl',
                          size === 'medium' && 'bg-neutral-700'
                        )}
                        onClick={() => changeSize('medium')}
                      >
                        Aa
                      </button>
                      <button
                        className={clsx(
                          'rounded-sm p-1 px-4 text-4xl',
                          size === 'large' && 'bg-neutral-700'
                        )}
                        onClick={() => changeSize('large')}
                      >
                        Aa
                      </button>
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="font-bold">Background Color</span>
                    <div className="flex gap-5">
                      <button
                        className={clsx(
                          'rounded-sm px-2 py-1',
                          background === 'transparent' && 'bg-neutral-700'
                        )}
                        onClick={() => changeBackgroundColor('transparent')}
                      >
                        Transparent
                      </button>
                      <button
                        className={clsx(
                          'rounded-sm px-2 py-1',
                          background === 'black'
                            ? 'bg-neutral-700'
                            : 'bg-[rgba(1,1,1,1)]'
                        )}
                        onClick={() => changeBackgroundColor('black')}
                      >
                        Black
                      </button>
                    </div>
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};
