import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import MaterialIcon from './material-icon';

type ModalProps = {
  title?: string;
  className?: string;
  open: boolean;
  disableBackdropClick?: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({
  title = '',
  className = '',
  open,
  onClose,
  disableBackdropClick = false,
  children,
}) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className={`${className} relative z-30`}
        onClose={disableBackdropClick ? () => {} : onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40 z-20" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto z-30">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-out duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-sm bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between"
                >
                  <span className="text-neutral-900 text-xl font-medium uppercase leading-6 text-indigo-800">
                    {title}
                  </span>
                  <button onClick={onClose}>
                    <MaterialIcon className="text-rose-500 hover:text-rose-400 outlined">
                      cancel
                    </MaterialIcon>
                  </button>
                </Dialog.Title>
                <div className="mt-2 text-neutral-900">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
