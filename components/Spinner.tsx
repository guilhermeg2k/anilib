import { FunctionComponent } from 'react';

interface SpinnerProps {
  className?: string;
}

const Spinner: FunctionComponent<SpinnerProps> = ({ className = '' }) => {
  return (
    <div
      className={`absolute ${className} animate-spin rounded-full w-8 h-8 border-t-4 border-gray-900 text-rose-600`}
    />
  );
};

export default Spinner;
