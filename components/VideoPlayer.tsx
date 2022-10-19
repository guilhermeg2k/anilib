import { Subtitle } from '@backend/database/types';
import { formatSecondsInTime } from '@utils/timeUtils';
import React, {
  KeyboardEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import InputSlider from 'react-input-slider';
import FadeTransition from './FadeTransition';
import MaterialIcon from './MaterialIcon';
import MenuDropdown from './MenuDropDown';

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
    <button onClick={onClick}>
      <MaterialIcon
        className={`${className} opacity-90 hover:opacity-100 text-white duration-200 ease-in-out  flex items-center`}
      >
        {children}
      </MaterialIcon>
    </button>
  );
};

interface VolumeBarProps {
  value: number;
  onChange: (time: number) => void;
}

const VolumeBar: React.FC<VolumeBarProps> = ({ value, onChange }) => {
  return (
    <InputSlider
      styles={{
        track: {
          cursor: 'pointer',
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          borderRadius: '1px',
          height: '5px',
        },
        active: {
          backgroundColor: '#fff',
          borderRadius: '1px',
        },
        thumb: {
          height: '10px',
          width: '10px',
          backgroundColor: '#fff',
        },
      }}
      axis="x"
      x={value}
      onChange={({ x }) => onChange(x)}
    />
  );
};

interface ProgressBarProps {
  value: number;
  onChange: (time: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, onChange }) => {
  return (
    <InputSlider
      styles={{
        track: {
          cursor: 'pointer',
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          borderRadius: '1px',
          height: '5px',
        },
        active: {
          backgroundColor: '#E11D48',
          borderRadius: '1px',
        },
        thumb: {
          display: 'none',
        },
      }}
      axis="x"
      x={value}
      onChange={({ x }) => onChange(x)}
    />
  );
};

interface VideoPlayerProps {
  videoUrl: string;
  coverImageBase64: string;
  episodeTitle: string;
  subtitles: Array<Subtitle>;
  onNextEpisode: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  episodeTitle,
  coverImageBase64: coverImage,
  subtitles,
  onNextEpisode,
}) => {
  const [currentSubtitleId, setCurrentSubtitleId] = useState(
    getDefaultSubtitle(subtitles)
  );
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState('0:00:00');
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasMouseMoved, setHasMouseMoved] = useState(true);
  const [isShowingVolumeSlider, setIsShowingVolumeSlider] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const videoPlayer = useRef<HTMLDivElement>(null);
  const currentCursorTimeoutRef = useRef({} as NodeJS.Timeout);

  const shouldShowControls = hasMouseMoved || !isPlaying;
  const isMuted = volume === 0;
  const videoCurrentTime = formatSecondsInTime(video.current?.currentTime);

  const seekToTime = (timeInSeconds: number) => {
    video.current!.currentTime = timeInSeconds;
  };

  const forward = (seconds: number) => {
    seekToTime(video.current!.currentTime + seconds);
  };

  const rewind = (seconds: number) => {
    seekToTime(video.current!.currentTime - seconds);
  };

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

  const onPlayToggleHandler = () => {
    if (isPlaying) {
      video.current!.pause();
    } else {
      video.current!.play();
    }
  };

  const onPauseHandler = () => {
    setIsPlaying(false);
  };

  const onPlayHandler = () => {
    setIsPlaying(true);
  };

  const onTimeChangeHandler = (time: number) => {
    if (time) {
      const currentTimeOnSeconds = (video.current!.duration * time) / 100;
      seekToTime(currentTimeOnSeconds);
    }
  };

  const onTimeUpdateHandler = () => {
    setCurrentTime(
      (video.current!.currentTime * 100) / video.current!.duration
    );
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

  const onNextEpisodeHandler = () => {
    onNextEpisode();
  };

  const onVideoKeyUpHandler = (event: KeyboardEvent) => {
    event.preventDefault();
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
      default:
        break;
    }
  };

  const onVolumeUpdateHandler = () => {
    setVolume(video.current!.volume * 100);
  };

  const onVolumeChangeHandler = (newVolume: number) => {
    if (newVolume) {
      video.current!.volume = newVolume / 100;
    }
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

  const onFullscreenUpdateHandler = () => {
    setIsFullscreen(Boolean(document.fullscreenElement));
  };

  const onLoadMetadataHandler = () => {
    const duration = formatSecondsInTime(video.current?.duration);
    setDuration(duration);
  };

  const onForward10SecondsHandler = () => {
    forward(10);
  };

  const onRewind10SecondsHandler = () => {
    rewind(10);
  };

  const toggleIsShowingVolumeSlider = () => {
    setIsShowingVolumeSlider(!isShowingVolumeSlider);
  };

  const buildSubtitlesOptions = () => {
    const subtitles = Array<ReactNode>();

    const disableSubtitlesOption = (
      <button
        key="disable-option"
        className="text-left p-2 font-semibold uppercase hover:bg-rose-700"
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
            className={`${selectedClass} text-left p-2 font-semibold uppercase hover:bg-rose-600`}
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

  useEffect(() => {
    document!.addEventListener('fullscreenchange', onFullscreenUpdateHandler);
  }, []);

  useEffect(() => {
    setCurrentSubtitleId(getDefaultSubtitle(subtitles));
  }, [subtitles]);

  useEffect(() => {
    setIsPlaying(false);
    video.current!.load();
  }, [videoUrl]);

  return (
    <div
      className={`${!shouldShowControls && 'cursor-none'} relative`}
      ref={videoPlayer}
      onMouseMove={onMouseMoveHandler}
      onMouseLeave={onMouseLeaveHandler}
      onKeyUp={onVideoKeyUpHandler}
    >
      <video
        id="videoPlayer"
        key={videoUrl}
        className="w-full h-full"
        ref={video}
        poster={`data:image/png;base64,${coverImage}`}
        preload="auto"
        onClick={onPlayToggleHandler}
        onLoadedMetadata={onLoadMetadataHandler}
        onPause={onPauseHandler}
        onPlay={onPlayHandler}
        onTimeUpdate={onTimeUpdateHandler}
        onVolumeChange={onVolumeUpdateHandler}
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
          className="absolute top-0  px-4 py-2 flex flex-col z-10 bg-gradient-to-b from-neutral-800 to-transparent w-full"
        >
          <span className="text-xl">{episodeTitle}</span>
          <button
            className="text-sm font-semibold text-start hover:text-rose-600 ease-in-out duration-200 select-none"
            onClick={onNextEpisodeHandler}
          >
            Next Episode
          </button>
        </div>

        <div
          id="video-middle-controls"
          className="flex absolute m-auto left-0 right-0 top-0 bottom-0 items-center justify-center gap-2 select-none"
        >
          <PlayerButton
            className="md-56 rounded-full bg-neutral-900/25 p-2"
            onClick={onRewind10SecondsHandler}
          >
            replay_10
          </PlayerButton>
          <PlayerButton
            className="md-72 bg-neutral-900/25 rounded-full p-2"
            onClick={onPlayToggleHandler}
          >
            {isPlaying ? 'pause' : 'play_arrow'}
          </PlayerButton>
          <PlayerButton
            className="md-56 bg-neutral-900/25 rounded-full p-2"
            onClick={onForward10SecondsHandler}
          >
            forward_10
          </PlayerButton>
        </div>

        <div
          id="video-bottom-controls"
          className="absolute bottom-0 w-full px-4 py-2 flex flex-col gap-2 bg-gradient-to-t from-neutral-800 to-transparent select-none"
        >
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-5">
              <PlayerButton onClick={onPlayToggleHandler}>
                {isPlaying ? 'pause' : 'play_circle'}
              </PlayerButton>

              <div
                className="flex gap-2 items-center"
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
                  <VolumeBar value={volume} onChange={onVolumeChangeHandler} />
                </div>
              </div>

              <MenuDropdown
                buttonClassName="flex items-center"
                menuClassName="bottom-8 bg-neutral-900 opacity-90 w-[150px]"
                items={buildSubtitlesOptions()}
              >
                <PlayerButton>
                  <i className="material-icons">subtitles</i>
                </PlayerButton>
              </MenuDropdown>
            </div>
            <PlayerButton onClick={onFullscreenToggleHandler}>
              <MaterialIcon>
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </MaterialIcon>
            </PlayerButton>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{videoCurrentTime}</span>
            <div className={`w-full flex items-center justify-center`}>
              <ProgressBar value={currentTime} onChange={onTimeChangeHandler} />
            </div>
            <span className="text-sm font-semibold">{duration}</span>
          </div>
        </div>
      </FadeTransition>
    </div>
  );
};

export default VideoPlayer;
