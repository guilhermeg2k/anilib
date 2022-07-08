import { FunctionComponent } from 'react';

interface BadgeProps {
  className?: string;
  children: React.ReactNode;
}

const Badge: FunctionComponent<BadgeProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`${className} flex justify-center uppercase p-1 font-semibold  text-xs md:text-sm font-roboto rounded-sm w-20 md:w-28`}
    >
      {children}
    </div>
  );
};

export default Badge;
