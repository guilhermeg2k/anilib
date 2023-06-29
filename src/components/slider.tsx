import { MouseEvent, useRef, useState } from 'react';

type SliderProps = {
  value?: number;
  maxValue?: number;
  onHover?: (value: number) => void;
  onChange?: (value: number) => void;
  backgroundClassName?: string;
  hoverClassName?: string;
  activeClassName?: string;
  thumbClassName?: string;
  alwaysShowThumb?: boolean;
};

const Slider = ({
  value = 0,
  maxValue = 100,
  onChange = () => {},
  onHover = () => {},
  backgroundClassName = '',
  hoverClassName = '',
  activeClassName = '',
  thumbClassName = '',
  alwaysShowThumb = false,
}: SliderProps) => {
  const [hoverPercentage, setHoverPercentage] = useState(0);
  const timeline = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const activePercentage = (100 * value) / maxValue;

  const isValidEvent = (e: MouseEvent) =>
    Boolean(timeline.current && e.target !== thumb.current);

  const onClickHandler = (e: MouseEvent<HTMLDivElement>) => {
    if (isValidEvent(e)) {
      const clickedPercentage =
        (e.nativeEvent.offsetX / timeline.current!.offsetWidth) * 100;
      const value = (maxValue * clickedPercentage) / 100;
      onChange(value);
    }
  };

  const onMouseMoveHandler = (e: MouseEvent<HTMLDivElement>) => {
    if (isValidEvent(e)) {
      const hoverPercentage =
        (e.nativeEvent.offsetX / timeline.current!.offsetWidth) * 100;
      const hoverValue = (maxValue * hoverPercentage) / 100;
      onHover(hoverValue);
      setHoverPercentage(hoverPercentage);
    }
  };

  return (
    <div
      ref={timeline}
      className={`group relative flex h-1.5 w-full cursor-pointer items-center rounded-sm bg-neutral-400 ${backgroundClassName}`}
      onClick={onClickHandler}
      onMouseMove={onMouseMoveHandler}
    >
      <div
        style={{ width: `${activePercentage}%` }}
        className={`relative z-10 h-1.5 bg-rose-600 ${activeClassName}`}
      />
      <div
        ref={thumb}
        style={{
          left: `calc(${activePercentage}% - 6px)`,
        }}
        className={` absolute z-10 h-3 w-3 rounded-full bg-rose-600 ${
          !alwaysShowThumb &&
          'scale-0 transition duration-100 group-hover:scale-100'
        } ${thumbClassName}`}
      />
      <div
        style={{
          width: `${hoverPercentage}%`,
        }}
        className={`absolute z-0 h-1.5 bg-neutral-300 opacity-0 transition duration-200 group-hover:opacity-100 ${hoverClassName}`}
      />
    </div>
  );
};

export default Slider;
