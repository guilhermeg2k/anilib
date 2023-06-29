import Spinner from './spinner';

type BackdropProps = {
  open: boolean;
};

const Backdrop: React.FC<BackdropProps> = ({ open }) => {
  if (!open) {
    return <></>;
  }

  return (
    <div className="fixed inset-0 bg-neutral-900 bg-opacity-50 z-50 flex">
      <div className="w-full flex items-center justify-center">
        <div className="flex flex-col justify-center items-center">
          <Spinner className="w-20 h-20" />
        </div>
      </div>
    </div>
  );
};

export default Backdrop;
