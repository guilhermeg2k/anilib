import { useRef, useState } from 'react';

interface SliderProps {
  value?: number;
  maxValue?: number;
  onHover?: (value: number) => void;
  onChange?: (value: number) => void;
  backgroundClassName?: string;
  trackClassName?: string;
  activeClassName?: string;
  thumbClassName?: string;
}

const Slider = ({
  value = 0,
  maxValue = 100,
  onChange = () => {},
  onHover = () => {},
  backgroundClassName = '',
  trackClassName = '',
  activeClassName = '',
  thumbClassName = '',
}: SliderProps) => {
  const [percentage, setPercentage] = useState(0);
  const [hoverPercentage, setHoverPercentage] = useState(0);
  const timeline = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);

  return (
    <div className="p-10">
      <div
        ref={timeline}
        className="w-full bg-neutral-100 h-4 opacity-90 relative flex items-center cursor-pointer group"
        onClick={(e) => {
          if (e.nativeEvent.target !== thumb.current) {
            setPercentage(
              Math.floor(
                (e.nativeEvent.offsetX / timeline.current?.offsetWidth) * 100
              )
            );
          }
        }}
        onMouseMove={(e) => {
          setHoverPercentage(
            Math.floor(
              (e.nativeEvent.offsetX / timeline.current?.offsetWidth) * 100
            )
          );
        }}
      >
        <div
          style={{ width: `${percentage}%` }}
          className={`bg-rose-600 h-4 relative z-10`}
        />
        <div
          style={{
            left: `${percentage - 1}%`,
          }}
          className={` bg-rose-600 h-8 w-8 absolute rounded-full z-10 transition duration-100 scale-0 group-hover:scale-100`}
        />
        <div
          style={{
            width: `${hoverPercentage + 1}%`,
          }}
          className={`bg-neutral-500 h-4 absolute z-0 transition duration-200 opacity-0 group-hover:opacity-100`}
        />
      </div>
    </div>
  );
};

export default Slider;
