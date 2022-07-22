import { FunctionComponent, ReactNode } from 'react';

interface MaterialIconProps {
  children: ReactNode;
  className?: string;
}

const MaterialIcon: FunctionComponent<MaterialIconProps> = ({
  className = '',
  children,
}) => {
  return <i className={`${className} material-icons`}>{children}</i>;
};

export default MaterialIcon;
