import Head from 'next/head';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import Navbar from './navbar';

type PageProps = {
  className?: string;
  title?: string;
  children: ReactNode;
};

const Page: React.FC<PageProps> = ({
  className = '',
  title = '',
  children,
}) => {
  const mergedClassName = twMerge(
    `px-4 py-3 lg:py-8 md:px-36 lg:px-52 z-0 w-full grow ${className} `
  );

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Navbar />
      <div className={mergedClassName}>{children}</div>
    </>
  );
};

export default Page;
