import { FunctionComponent } from 'react';
import InputSlider from 'react-input-slider';

interface SliderProps {
  value: number;
  className?: string;
  onChange?: (value: number) => void;
}

const Slider: FunctionComponent<SliderProps> = ({
  value,
  className = '',
  onChange = () => {},
}) => {
  return (
    <div className={className}>
      <InputSlider
        styles={{
          track: {
            cursor: 'pointer',
            width: '100%',
            backgroundColor: '#881337',
            borderRadius: '2px',
          },
          active: {
            backgroundColor: '#E11D48',
            borderRadius: '2px',
          },
          thumb: {
            backgroundColor: '#E11D48',
          },
        }}
        axis="x"
        x={value}
        onChange={({ x }) => onChange(x)}
      />
    </div>
  );
};

export default Slider;
