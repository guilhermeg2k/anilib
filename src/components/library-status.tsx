import { Flip, Id, ToastPosition, toast } from 'react-toastify';
import Spinner from './spinner';
import { trpc } from 'common/utils/trpc';
import { useLibraryStatusStore } from 'store/library-status';
import { useRef } from 'react';
import { LibraryStatus } from '@common/types/library';

const TOAST_POSITION = 'bottom-right' as ToastPosition;
const TOAST_TRANSITION = Flip;

const ToastContent = ({
  text,
  showSpinner = false,
}: {
  text: string;
  showSpinner?: boolean;
}) => {
  return (
    <div className="flex items-center justify-between">
      {text}
      {showSpinner && <Spinner />}
    </div>
  );
};

const LibraryStatus = () => {
  const toastId = useRef<Id | null>();
  const { setStatus } = useLibraryStatusStore();
  trpc.ws.library.onUpdate.useSubscription(undefined, {
    onData: (data) => {
      onLibraryUpdateListener(data);
    },
  });

  trpc.ws.library.getStatus.useQuery(undefined, {
    onSuccess: (status) => {
      if (status === 'UPDATING' || status === 'FAILED') {
        onLibraryUpdateListener(status);
      }
    },
  });

  const onCloseHandler = () => {
    toastId.current = null;
    1;
  };

  const updatedToastOptions = {
    autoClose: 5000,
    closeButton: false,
    type: toast.TYPE.SUCCESS,
    position: TOAST_POSITION,
    transition: TOAST_TRANSITION,
    onClose: onCloseHandler,
  };

  const updatingToastOptions = {
    autoClose: false as false,
    closeButton: false,
    type: toast.TYPE.DEFAULT,
    position: TOAST_POSITION,
    transition: TOAST_TRANSITION,
    onClose: onCloseHandler,
  };

  const failedToastOptions = {
    autoClose: 5000,
    closeButton: false,
    type: toast.TYPE.ERROR,
    position: TOAST_POSITION,
    transition: TOAST_TRANSITION,
    onClose: onCloseHandler,
  };

  const showUpdatedToast = () => {
    if (toastId.current) {
      toast.update(toastId.current, {
        render: <ToastContent text="Library Updated" />,
        ...updatedToastOptions,
      });
    } else {
      toastId.current = toast(
        <ToastContent text="Library Updated" />,
        updatedToastOptions
      );
    }
  };

  const showUpdatingToast = () => {
    if (toastId.current) {
      toast.update(toastId.current, {
        render: <ToastContent text="Updating Library" showSpinner />,
        ...updatingToastOptions,
      });
    } else {
      toastId.current = toast(
        <ToastContent text="Updating Library" showSpinner />,
        updatingToastOptions
      );
    }
  };

  const showFailedToast = () => {
    if (toastId.current) {
      toast.update(toastId.current, {
        render: <ToastContent text="Failed to update library" />,
        ...failedToastOptions,
      });
    } else {
      toastId.current = toast(
        <ToastContent text="Failed to update library" />,
        failedToastOptions
      );
    }
  };

  const showStatusToast = (status: LibraryStatus) => {
    switch (status) {
      case 'UPDATING':
        showUpdatingToast();
        break;
      case 'UPDATED':
        showUpdatedToast();
        break;
      case 'FAILED':
        showFailedToast();
        break;
    }
  };

  const onLibraryUpdateListener = (status: LibraryStatus) => {
    setStatus(status);
    showStatusToast(status);
  };

  return <></>;
};

export default LibraryStatus;
