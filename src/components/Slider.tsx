import { MouseEvent, useRef, useState } from 'react';

interface SliderProps {
  value?: number;
  maxValue?: number;
  onHover?: (value: number) => void;
  onChange?: (value: number) => void;
  backgroundClassName?: string;
  hoverClassName?: string;
  activeClassName?: string;
  thumbClassName?: string;
  alwaysShowThumb?: boolean;
}

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
  const activePercentage = (100 * value) / maxValue;

  const onClickHandler = (e: MouseEvent<HTMLDivElement>) => {
    if (timeline.current) {
      const clickedPercentage = Math.floor(
        (e.nativeEvent.offsetX / timeline.current.offsetWidth) * 100
      );
      const value = (maxValue * clickedPercentage) / 100;
      onChange(value);
    }
  };

  const onMouseMoveHandler = (e: MouseEvent<HTMLDivElement>) => {
    if (timeline.current) {
      const hoverPercentage = Math.floor(
        (e.nativeEvent.offsetX / timeline.current.offsetWidth) * 100
      );
      const hoverValue = (maxValue * hoverPercentage) / 100;
      onHover(hoverValue);
      setHoverPercentage(
        Math.floor((e.nativeEvent.offsetX / timeline.current.offsetWidth) * 100)
      );
    }
  };

  return (
    <div
      ref={timeline}
      className={`w-full bg-neutral-400 rounded-sm h-1.5 relative flex items-center cursor-pointer group ${backgroundClassName}`}
      onClick={onClickHandler}
      onMouseMove={onMouseMoveHandler}
    >
      <div
        style={{ width: `${activePercentage}%` }}
        className={`bg-rose-600 h-1.5 relative z-10 ${activeClassName}`}
      />
      <div
        style={{
          left: `${activePercentage - 1}%`,
        }}
        className={` bg-rose-600 h-3 w-3 absolute rounded-full z-10 ${
          !alwaysShowThumb &&
          'transition duration-100 scale-0 group-hover:scale-100'
        } ${thumbClassName}`}
      />
      <div
        style={{
          width: `${hoverPercentage}%`,
        }}
        className={`bg-neutral-300 h-1.5 absolute z-0 transition duration-200 opacity-0 group-hover:opacity-100 ${hoverClassName}`}
      />
    </div>
  );
};

export default Slider;
