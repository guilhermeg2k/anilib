interface LogoProps {
  className?: string;
}

const Logo: React.FunctionComponent<LogoProps> = ({ className = '' }) => {
  return (
    <h1 className={`uppercase ${className}`}>
      <span className="text-white">ani</span>
      <span className="text-rose-700 font-atkinson">lib</span>
    </h1>
  );
};

export default Logo;
