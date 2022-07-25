interface PageProps {
  className?: string;
  children: React.ReactNode;
}

const Page: React.FunctionComponent<PageProps> = ({
  className = '',
  children,
}) => {
  return (
    <div
      className={`${className} px-4 md:px-36 lg:px-52 mt-[70px] md:mt-[90px] py-10 z-0  w-full bg-cover bg-center bg-no-repeat bg-fixed`}
      style={{ backgroundImage: `url('/images/bg.jpg')` }}
    >
      {children}
    </div>
  );
};

export default Page;
