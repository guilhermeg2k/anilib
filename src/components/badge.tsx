import { ReactNode } from 'react';

const Badge = ({
  children,
  className = '',
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={`${className} flex justify-center uppercase p-1 px-3 font-bold text-xs  font-roboto rounded-sm w-min-20`}
    >
      {children}
    </div>
  );
};

export default Badge;
