import { ReactNode } from 'react';

interface MaterialIconProps {
  children: ReactNode;
  className?: string;
}

const MaterialIcon: React.FC<MaterialIconProps> = ({
  className = '',
  children,
}) => {
  return <i className={`${className} material-icons`}>{children}</i>;
};

export default MaterialIcon;
