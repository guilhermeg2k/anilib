import { ReactNode } from 'react';

interface PageProps {
  className?: string;
  children: ReactNode;
}

const Page: React.FC<PageProps> = ({ className = '', children }) => {
  return (
    <div
      className={`${className} px-4 py-3 lg:py-8 md:px-36 lg:px-52 z-0 w-full`}
    >
      {children}
    </div>
  );
};

export default Page;
