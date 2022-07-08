interface ButtonProps {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button = ({ children, onClick }: ButtonProps) => {
  return (
    <button
      className={`bg-rose-700 hover:bg-rose-600 active:bg-rose-700 min-w-[70px] lg:min-w-[135px] font-roboto font-bold uppercase text-white duration-200 ease-in-out py-1 lg:py-2`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
