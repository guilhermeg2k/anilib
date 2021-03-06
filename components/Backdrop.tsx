import { FunctionComponent } from 'react';
import Spinner from './Spinner';

interface BackdropProps {
  open: boolean;
}

const Backdrop: FunctionComponent<BackdropProps> = ({ open }) => {
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
