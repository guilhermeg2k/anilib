import { ReactNode } from 'react';

type DataDisplayProps = {
  className?: string;
  children: ReactNode;
};

const DataDisplay: React.FC<DataDisplayProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`border border-neutral-300 p-2 ${className}`}>
      {children}
    </div>
  );
};

export default DataDisplay;
