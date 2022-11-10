interface SpinnerProps {
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ className = '' }) => {
  return (
    <div
      className={`${className} animate-spin rounded-full w-8 h-8 border-t-4 border-gray-900 text-rose-600`}
    />
  );
};

export default Spinner;
