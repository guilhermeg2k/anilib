import { LibraryStatus as LibraryStatusEnum } from '@backend/constants/library-status';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { Flip, Id, ToastPosition, toast } from 'react-toastify';
import Spinner from './spinner';
import { trpc } from '@utils/trpc';
import { useLibraryStatusStore } from 'store/library-status-store';

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
  const router = useRouter();
  const { status, setStatus } = useLibraryStatusStore();
  trpc.ws.library.onUpdate.useSubscription(undefined, {
    onData: (data) => {
      onLibraryUpdateListener(data as LibraryStatusEnum);
    },
  });

  trpc.ws.library.getStatus.useQuery(undefined, {
    onSuccess: (status) => {
      if (
        status === LibraryStatusEnum.Updating ||
        status === LibraryStatusEnum.Failed
      ) {
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

  const showStatusToast = (status: LibraryStatusEnum) => {
    switch (status) {
      case LibraryStatusEnum.Updating:
        showUpdatingToast();
        break;
      case LibraryStatusEnum.Updated:
        showUpdatedToast();
        break;
      case LibraryStatusEnum.Failed:
        showFailedToast();
        break;
    }
  };

  const onLibraryUpdateListener = (status: LibraryStatusEnum) => {
    setStatus(status);
    showStatusToast(status);
  };

  useEffect(() => {
    if (status && status === LibraryStatusEnum.Updated) {
      router.replace(router.asPath);
    }
  }, [status]);

  return <></>;
};

export default LibraryStatus;
