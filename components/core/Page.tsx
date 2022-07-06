interface PageProps {
  className?: string;
  children: React.ReactNode;
}

const Page: React.FunctionComponent<PageProps> = ({
  className = '',
  children,
}) => {
  return (
    <div className={`${className} min-h-screen px-52 mt-[96px] py-5`}>
      {children}
    </div>
  );
};

export default Page;
