import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface PageProps {
  className?: string;
  children: ReactNode;
}

const Page: React.FC<PageProps> = ({ className = '', children }) => {
  const mergedClassName = twMerge(
    `px-4 py-3 lg:py-8 md:px-36 lg:px-52 z-0 w-full ${className} `
  );

  return <div className={mergedClassName}>{children}</div>;
};

export default Page;