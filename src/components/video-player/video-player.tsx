import { Popover } from '@components/popover';
import { Tab } from '@headlessui/react';
import { formatSecondsInTime } from 'common/utils/time';
import { clsx } from 'clsx';
import { useCueChange } from 'hooks/use-cue-change';
import { useEventListener } from 'hooks/use-event-listener';
import Image from 'next/image';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import FadeTransition from '../fade-transition';
import MaterialIcon from '../material-icon';
import Slider from '../slider';
import {
  useVideoPlayerStore,
  SubtitleBackground,
  SubtitleColor,
  SubtitleSize,
} from './video-player-store';
import HTMLParser from 'html-react-parser';
import { BRACES_CONTENT_REGEX } from '@common/constants/regex';
import { Subtitle } from '@common/types/database';

export const VideoPlayer = ({
  videoUrl,
  episodeTitle,
  coverImageBase64: coverImage,
  subtitles,
  previews,
  onNextEpisode,
}: {
  videoUrl: string;
  coverImageBase64: string;
  episodeTitle: string;
  subtitles: Array<Subtitle>;
  previews: Array<string | null>;
  onNextEpisode: () => void;
}) => {
  const [hasMouseMoved, setHasMouseMoved] = useState(false);
  const videoPlayerDiv = useRef<HTMLDivElement>(null);
  const hideCursorTimeout = useRef<NodeJS.Timeout>(setTimeout(() => {}, 0));
  const {
    video,
    setVideo,
    isPlaying,
    setIsPlaying,
    isFullscreen,
    setIsFullscreen,
    volume,
    setVolume,
    setCurrentTime,
    setDuration,
    currentSubtitleId,
    setCurrentSubtitleId,
    shouldShowControls,
    setShouldShowControls,
  } = useVideoPlayerStore();

  const onMouseMoveHandler = () => {
    clearInterval(hideCursorTimeout.current);
    setHasMouseMoved(true);
    hideCursorTimeout.current = setTimeout(function () {
      setHasMouseMoved(false);
    }, 2500);
  };

  const onMouseLeaveHandler = () => {
    clearInterval(hideCursorTimeout.current);
    setHasMouseMoved(false);
  };

  const onLoadMetadataHandler = () => {
    const duration = video?.duration ?? 0;
    setDuration(duration);
  };

  const onKeyUpHandler = useCallback(
    (event: KeyboardEvent) => {
      if (isFullscreen) {
        switch (event.code) {
          case 'Space':
            togglePlay(video);
            break;
          case 'ArrowLeft':
            rewind(video, 10);
            break;
          case 'ArrowRight':
            forward(video, 10);
            break;
          case 'ArrowUp':
            increaseVolume(video, 10);
            break;
          case 'ArrowDown':
            decreaseVolume(video, 10);
            break;
          default:
            break;
        }
      }
    },
    [video, isFullscreen]
  );

  const onFullScreenChange = useCallback(() => {
    setIsFullscreen(Boolean(document.fullscreenElement));
  }, [setIsFullscreen]);

  const setInitialSubtitle = useCallback(() => {
    if (video) {
      const defaultSubtitle = getDefaultSubtitle(subtitles) ?? '';
      setCurrentSubtitleId(defaultSubtitle);

      Array.from(video.textTracks).forEach((textTrack) => {
        if (textTrack.id !== defaultSubtitle) {
          textTrack.mode = 'hidden';
        } else {
          textTrack.mode = 'showing';
          setCurrentSubtitleId(textTrack.id);
        }
      });
    }
  }, [video, subtitles, setCurrentSubtitleId]);

  useEventListener('fullscreenchange', onFullScreenChange);

  useEventListener('keyup', onKeyUpHandler);

  useEffect(setInitialSubtitle, [setInitialSubtitle]);

  useEffect(() => {
    setShouldShowControls(hasMouseMoved || !isPlaying);
  }, [hasMouseMoved, isPlaying, setShouldShowControls]);

  useEffect(() => {
    if (video) {
      setIsPlaying(false);
      video.load();
      video.volume = volume / 100;
    }
  }, [video, setIsPlaying]);

  return (
    <div
      className={clsx('relative', !shouldShowControls && 'cursor-none')}
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
        poster={coverImage}
        preload="auto"
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
              src={`/api/subtitle-vtt-file/${subtitle.id}`}
              srcLang={subtitle.language}
              label={subtitle.label}
              kind="subtitles"
              default={isSubtitleDefault}
            />
          );
        })}
      </video>
      <Subtitles />
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
            onClick={() => rewind(video, 10)}
          >
            replay_10
          </PlayerButton>
          <PlayerButton
            className="md-72 scale-75 rounded-full bg-neutral-900/25 p-2 md:scale-100"
            onClick={() => togglePlay(video)}
          >
            {isPlaying ? 'pause' : 'play_arrow'}
          </PlayerButton>
          <PlayerButton
            className="md-56 scale-75 rounded-full bg-neutral-900/25 p-2 md:scale-100"
            onClick={() => forward(video, 10)}
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
              <PlayerButton onClick={() => togglePlay(video)}>
                {isPlaying ? 'pause' : 'play_circle'}
              </PlayerButton>
              <VolumeButton />
              {subtitles.length > 0 && <SubtitleButton />}
            </div>
            <PlayerButton
              onClick={() => toggleFullscreen(videoPlayerDiv.current)}
            >
              <MaterialIcon>
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </MaterialIcon>
            </PlayerButton>
          </div>
          <TimeLine previews={previews} />
        </div>
      </FadeTransition>
    </div>
  );
};

const Subtitles = () => {
  const [activeCues, setActiveCues] = useState<VTTCue[] | never[]>([]);
  const {
    video,
    currentSubtitleId,
    subtitleConfig,
    shouldShowControls: isShowingControls,
  } = useVideoPlayerStore();
  const { color, background, size } = subtitleConfig;

  const currentTextTrack = useMemo(() => {
    setActiveCues([]);
    if (video && currentSubtitleId) {
      return Array.from(video.textTracks).find(
        (textTrack) => textTrack.id === currentSubtitleId
      );
    }
  }, [video, currentSubtitleId]);

  const onCueChangeHandler = useCallback(() => {
    const cues = currentTextTrack?.activeCues || [];
    setActiveCues(Array.from(cues) as VTTCue[]);
  }, [currentTextTrack?.activeCues]);

  const textClassName = buildSubtitleTextClass(color, size);
  const backgroundClassName = buildSubtitlesBackgroundColor(background);

  useCueChange(currentTextTrack, onCueChangeHandler);

  return (
    <div
      className={`absolute ${
        isShowingControls ? 'bottom-16' : 'bottom-0'
      } flex w-full select-none flex-col items-center gap-2   px-4 py-2`}
    >
      {activeCues.length > 0 && (
        <div className={`px-4 py-1 ${backgroundClassName}`}>
          {activeCues.map((cue) => {
            return (
              <div
                key={`${cue.startTime}-${cue.endTime}-${cue.text}`}
                style={{
                  textShadow:
                    background === 'transparent'
                      ? '#000 0px 0px 3px, #000 0px 0px 3px, #000 0px 0px 3px, #000 0px 0px 3px, #000 0px 0px 3px, #000 0px 0px 3px'
                      : '',
                }}
                className={`${textClassName} text-center font-subtitle font-bold antialiased`}
              >
                {parserSubtitleText(cue.text)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SubtitleButton = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const {
    video,
    currentSubtitleId,
    subtitleConfig,
    setCurrentSubtitleId,
    setSubtitleConfig,
  } = useVideoPlayerStore();

  const { color, background, size } = subtitleConfig;

  const changeTextColor = (color: SubtitleColor) => {
    setSubtitleConfig({ ...subtitleConfig, color });
  };

  const changeBackgroundColor = (background: SubtitleBackground) => {
    setSubtitleConfig({ ...subtitleConfig, background });
  };

  const changeSize = (size: SubtitleSize) => {
    setSubtitleConfig({ ...subtitleConfig, size });
  };

  const disableSubtitles = () => {
    Array.from(video!.textTracks).forEach(
      (textTrack) => (textTrack.mode = 'hidden')
    );
    setCurrentSubtitleId('');
  };

  const changeSubtitle = (textTrackId: string) => {
    Array.from(video!.textTracks).forEach((textTrack) => {
      if (textTrack.id !== textTrackId) {
        textTrack.mode = 'hidden';
      } else {
        textTrack.mode = 'showing';
        setCurrentSubtitleId(textTrack.id);
      }
    });
  };

  return (
    <Popover
      className="relative flex"
      button={
        <PlayerButton>
          <i className="material-icons">subtitles</i>
        </PlayerButton>
      }
    >
      <Tab.Group
        onChange={(index) => setSelectedTab(index)}
        selectedIndex={selectedTab}
      >
        <Tab.List className="grid grid-cols-2 gap-2">
          <SubtitleTab active={selectedTab === 0}>Language</SubtitleTab>
          <SubtitleTab active={selectedTab === 1}>Settings</SubtitleTab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <div className="flex flex-col py-2 overflow-y-scroll overflow-x-hidden max-h-52">
              {video &&
                Array.from(video.textTracks).map((trackText) => {
                  return (
                    <SubtitleOptionButton
                      key={trackText.id}
                      onClick={() => changeSubtitle(trackText.id)}
                      active={currentSubtitleId === trackText.id}
                    >
                      {trackText.language}
                      {trackText.label !== trackText.language
                        ? `-${trackText.label}`
                        : ''}
                    </SubtitleOptionButton>
                  );
                })}
              <SubtitleOptionButton
                key="disable-option"
                onClick={disableSubtitles}
                active={currentSubtitleId === ''}
              >
                Disabled
              </SubtitleOptionButton>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="flex flex-col gap-2 py-2">
              <div className="flex flex-col gap-1">
                <SubtitleSettingTitle>Text Color</SubtitleSettingTitle>
                <div className="flex gap-5">
                  <SubtitleColorButton
                    onClick={() => changeTextColor('white')}
                    active={color === 'white'}
                  >
                    White
                  </SubtitleColorButton>
                  <SubtitleColorButton
                    className="text-amber-300"
                    active={color === 'yellow'}
                    onClick={() => changeTextColor('yellow')}
                  >
                    Yellow
                  </SubtitleColorButton>
                </div>
              </div>
              <div>
                <SubtitleSettingTitle>Text Size</SubtitleSettingTitle>
                <div className="flex gap-5">
                  <SubtitleSizeButton
                    className="text"
                    active={size === 'small'}
                    onClick={() => changeSize('small')}
                  />
                  <SubtitleSizeButton
                    className="text-2xl"
                    active={size === 'medium'}
                    onClick={() => changeSize('medium')}
                  />
                  <SubtitleSizeButton
                    className="text-4xl"
                    active={size === 'large'}
                    onClick={() => changeSize('large')}
                  />
                </div>
              </div>
              <div className="text-xs">
                <SubtitleSettingTitle>Background Color</SubtitleSettingTitle>
                <div className="flex gap-5">
                  <SubtitleBackgroundButton
                    className={clsx(
                      background === 'transparent' && 'bg-neutral-700'
                    )}
                    onClick={() => changeBackgroundColor('transparent')}
                  >
                    Transparent
                  </SubtitleBackgroundButton>
                  <SubtitleBackgroundButton
                    className={clsx(
                      background === 'black' ? 'bg-neutral-700' : 'bg-[black]'
                    )}
                    onClick={() => changeBackgroundColor('black')}
                  >
                    Black
                  </SubtitleBackgroundButton>
                </div>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </Popover>
  );
};

const SubtitleSettingTitle = ({ children }: { children: ReactNode }) => {
  return <span className="text-xs font-bold">{children}</span>;
};

const SubtitleTab = ({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) => {
  return (
    <Tab
      className={clsx(
        'rounded-sm p-1 px-4 font-semibold uppercase',
        active && 'bg-neutral-700'
      )}
    >
      {children}
    </Tab>
  );
};

const SubtitleOptionButton = ({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active: boolean;
  children: ReactNode;
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (active && buttonRef.current) {
      buttonRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'center',
      });
    }
  }, [active]);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={clsx(
        `w-full text-ellipsis whitespace-nowrap mb-1 text-left font-semibold uppercase hover:text-rose-700`,
        active ? 'text-white' : 'text-neutral-400'
      )}
    >
      {children}
    </button>
  );
};

const SubtitleColorButton = ({
  className = '',
  active,
  onClick,
  children,
}: {
  className?: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) => {
  return (
    <button
      className={clsx(className, 'rounded-sm p-1', active && 'bg-neutral-700')}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const SubtitleSizeButton = ({
  className,
  active,
  onClick,
}: {
  className?: string;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      className={clsx(
        className,
        'text rounded-sm p-1 px-4',
        active && 'bg-neutral-700'
      )}
      onClick={onClick}
    >
      Aa
    </button>
  );
};

const SubtitleBackgroundButton = ({
  className,
  onClick,
  children,
}: {
  className?: string;
  onClick: () => void;
  children: ReactNode;
}) => {
  return (
    <button
      className={clsx(className, 'rounded-sm px-2 py-1')}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const VolumeButton = () => {
  const [isShowingVolumeSlider, setIsShowingVolumeSlider] = useState(false);
  const { video, volume } = useVideoPlayerStore();
  const isMuted = volume === 0;

  return (
    <div
      className="flex items-center gap-2"
      onMouseEnter={() => setIsShowingVolumeSlider(!isShowingVolumeSlider)}
      onMouseLeave={() => setIsShowingVolumeSlider(!isShowingVolumeSlider)}
    >
      <PlayerButton onClick={() => toggleMute(video)}>
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
  );
};

const TimeLine = ({ previews }: { previews: (string | null)[] }) => {
  const [hoverTimeInSeconds, setHoverTimeInSeconds] = useState<number>(0);
  const { video, currentTime, duration } = useVideoPlayerStore();

  const formattedHoverTime = formatSecondsInTime(hoverTimeInSeconds);
  const formattedDuration = formatSecondsInTime(duration);
  const formattedCurrentTime = formatSecondsInTime(currentTime);
  const hoverTimePercentage =
    (hoverTimeInSeconds * 100) / (video?.duration || 1);
  const currentHoverPreview =
    hoverTimeInSeconds != null && previews[Math.floor(hoverTimeInSeconds / 10)];
  const currentHoverPreviewSrc =
    currentHoverPreview && `data:image/jpg;base64,${currentHoverPreview}`;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold">{formattedCurrentTime}</span>
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
          onChange={(time) => seekToTime(video, time)}
          onHover={(time) => setHoverTimeInSeconds(time)}
          thumbClassName="bg-neutral-50"
        />
      </div>
      <span className="text-sm font-semibold">{formattedDuration}</span>
    </div>
  );
};

const PlayerButton = ({
  className = '',
  onClick = () => {},
  children,
}: {
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
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

const parserSubtitleText = (subtitle: string) => {
  const subtitleWithoutComments = subtitle.replaceAll(BRACES_CONTENT_REGEX, '');
  const parsedText = HTMLParser(subtitleWithoutComments);
  return parsedText;
};

const buildSubtitleTextClass = (color: SubtitleColor, size: SubtitleSize) => {
  const colorClass = buildSubtitlesColor(color);
  const sizeClass = buildSubtitlesSize(size);

  return `${colorClass} ${sizeClass}`;
};

const buildSubtitlesColor = (color: SubtitleColor) => {
  switch (color) {
    case 'white':
      return 'text-white-300';
    case 'yellow':
      return 'text-amber-300';
  }
};

const buildSubtitlesSize = (size: SubtitleSize) => {
  switch (size) {
    case 'small':
      return 'text-2xl';
    case 'medium':
      return 'text-4xl';
    case 'large':
      return 'text-6xl';
  }
};

const buildSubtitlesBackgroundColor = (background: SubtitleBackground) => {
  switch (background) {
    case 'black':
      return 'bg-[rgba(1,1,1,0.6)] ';
    case 'transparent':
      return 'bg-transparent';
  }
};

const seekToTime = (video: HTMLVideoElement | null, timeInSeconds: number) => {
  if (video) {
    video.currentTime = timeInSeconds;
  }
};

const forward = (video: HTMLVideoElement | null, seconds: number) => {
  if (video) {
    seekToTime(video, video.currentTime + seconds);
  }
};

const rewind = (video: HTMLVideoElement | null, seconds: number) => {
  if (video) {
    seekToTime(video, video.currentTime - seconds);
  }
};

const increaseVolume = (video: HTMLVideoElement | null, amount: number) => {
  if (video) {
    video.volume = Math.min((video.volume + amount) / 100, 1);
  }
};

const decreaseVolume = (video: HTMLVideoElement | null, amount: number) => {
  if (video) {
    video.volume = Math.max((video.volume - amount) / 100, 0);
  }
};

const togglePlay = (video: HTMLVideoElement | null) => {
  if (!video) return;
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
};

const toggleMute = (video: HTMLVideoElement | null) => {
  if (!video) return;
  if (video.volume === 0) {
    video.volume = 1;
  } else {
    video.volume = 0;
  }
};

const toggleFullscreen = (videoPlayerDiv: HTMLDivElement | null) => {
  if (!videoPlayerDiv) return;
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    videoPlayerDiv.requestFullscreen();
  }
};

const getDefaultSubtitle = (subtitles: Array<Subtitle>) =>
  subtitles.length === 1
    ? subtitles[0].id
    : subtitles.find((subtitle) => subtitle.language === 'por')?.id;
