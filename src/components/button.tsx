import { ReactNode } from 'react';

type ButtonProps = {
  size?: 'small' | 'normal' | 'large';
  className?: string;
  color?: 'red' | 'green' | 'white';
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
};

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  size = 'normal',
  color = 'green',
  disabled = false,
  onClick = () => {},
}) => {
  const buildColorClasses = () => {
    if (disabled) {
      return 'bg-neutral-300 text-neutral-400';
    }

    switch (color) {
      case 'red':
        return 'bg-red-600 hover:bg-red-500 active:bg-red-600';
      case 'green':
        return 'bg-green-500 hover:bg-green-400 active:bg-green-500';
      case 'white':
        return 'bg-white hover:bg-neutral-100 active:bg-neutral-200 text-neutral-800';
      default:
        return '';
    }
  };

  const buildSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'py-2 px-2 text-xs';
      case 'normal':
        return 'py-2 px-4 text-sm';
      case 'large':
        return 'py-4 px-8';
      default:
        return '';
    }
  };

  return (
    <button
      className={`${className} ${buildSizeClasses()} ${buildColorClasses()} min-w-[100px] font-roboto font-bold uppercase text-white duration-200 ease-in-out rounded-sm`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex items-center justify-center gap-1">{children}</div>
    </button>
  );
};

export default Button;
