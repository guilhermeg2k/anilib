import { ReactNode } from 'react';

type BadgeProps = {
  className?: string;
  children: ReactNode;
};

const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`${className} flex justify-center uppercase p-1 px-3 font-bold text-xs  font-roboto rounded-sm w-min-20`}
    >
      {children}
    </div>
  );
};

export default Badge;
