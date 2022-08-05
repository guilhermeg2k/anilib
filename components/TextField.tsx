import React from 'react';
import Label from './Label';

interface TextFieldProps {
  value: string;
  id: string;
  label?: string;
  placeHolder?: string;
  className?: string;
  maxLength?: number;
  onChange: (value: string) => void;
}

const TextField: React.FC<TextFieldProps> = ({
  id,
  value,
  label = '',
  placeHolder = '',
  className,
  maxLength,
  onChange,
}) => {
  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (!maxLength || newValue.length < maxLength) {
      onChange(newValue);
    }
  };
  return (
    <div className={`${className}`}>
      {label && <Label htmlFor={id}> {label} </Label>}
      <input
        id={id}
        value={value}
        type="text"
        placeholder={placeHolder}
        className={`w-full border border-neutral-300  p-2 outline-none hover:border-neutral-600 focus:border-neutral-600 focus:ring-0`}
        onChange={onChangeHandler}
        autoComplete="off"
      />
    </div>
  );
};

export default TextField;
