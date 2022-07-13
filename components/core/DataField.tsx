interface DataFieldProps {
  className?: string;
  children: React.ReactNode;
}

const DataField = ({ children, className = '' }: DataFieldProps) => {
  return (
    <div className={`border border-neutral-300 p-2 ${className}`}>
      {children}
    </div>
  );
};

export default DataField;
