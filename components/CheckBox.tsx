import { ReactNode } from 'react';

interface CheckBoxProps {
  id?: string;
  value: boolean;
  className?: string;
  children: ReactNode;
  onChange: (value: boolean) => void;
}

const CheckBox: React.FC<CheckBoxProps> = ({
  id,
  value,
  className = '',
  children,
  onChange,
}) => {
  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <div className={`${className} flex items-center gap-1`}>
      <input
        type="checkbox"
        checked={value}
        id={id}
        className="h-5 w-5 rounded-sm border border-neutral-300 text-indigo-900 
                  hover:border-indigo-900 focus:border-indigo-600 focus:ring-indigo-300 text-rose-700 focus:ring-rose-700"
        onChange={onChangeHandler}
      />
      <label className="font-medium " htmlFor={id}>
        {children}
      </label>
    </div>
  );
};

export default CheckBox;
