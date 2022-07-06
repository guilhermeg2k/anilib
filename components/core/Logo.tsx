interface LogoProps {
  className?: string;
}

const Logo: React.FunctionComponent<LogoProps> = ({ className = '' }) => {
  return (
    <h1 className={`uppercase font-atkinson ${className}`}>
      <span className="text-white">ani</span>
      <span className="text-rose-700 ">lib</span>
    </h1>
  );
};

export default Logo;
