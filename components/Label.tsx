import { ReactNode } from 'react';

interface LabelProps {
  children: ReactNode;
  htmlFor?: string;
}

const Label: React.FC<LabelProps> = ({ children, htmlFor }) => {
  return (
    <label
      htmlFor={htmlFor}
      className="block py-1 text-sm font-medium uppercase"
    >
      {children}
    </label>
  );
};

export default Label;
