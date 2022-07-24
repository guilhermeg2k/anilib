interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
}

const Label = ({ children, htmlFor }: LabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className="block py-1 text-sm font-medium uppercase"
    >
      {children}
    </label>
  );
};

export default Label;
