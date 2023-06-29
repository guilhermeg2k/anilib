import Link from 'next/link';

type LogoProps = {
  className?: string;
};

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <h1 className={`uppercase font-atkinson ${className}`}>
      <Link href="/">
        <a>
          <span className="text-white">ani</span>
          <span className="text-rose-700 ">lib</span>
        </a>
      </Link>
    </h1>
  );
};

export default Logo;
