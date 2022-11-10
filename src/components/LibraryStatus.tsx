import { LibraryStatus as LibraryStatusEnum } from '@backend/constants/libraryStatus';
import { WebsocketEvent } from '@backend/constants/websocketEvents';
import LibraryService from '@services/libraryService';
import socketIOClient from 'library/socketIOClient';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { Flip, Id, toast, ToastPosition } from 'react-toastify';
import Spinner from './Spinner';

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

  const onCloseHandler = () => {
    toastId.current = null;
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

  const updateStatus = (status: LibraryStatusEnum) => {
    switch (status) {
      case LibraryStatusEnum.Updating:
        showUpdatingToast();
        break;
      case LibraryStatusEnum.Updated:
        showUpdatedToast();
        router.replace(router.asPath);
        break;
      case LibraryStatusEnum.Failed:
        showFailedToast();
        break;
    }
  };

  const fetchInitialStatus = async () => {
    const status = await LibraryService.getStatus();
    if (
      status === LibraryStatusEnum.Updating ||
      status === LibraryStatusEnum.Failed
    ) {
      updateStatus(status);
    }
  };

  useEffect(() => {
    fetchInitialStatus();
    socketIOClient.on(WebsocketEvent.UpdateLibraryStatus, (status) => {
      updateStatus(status);
    });
  }, []);
  return <></>;
};

export default LibraryStatus;
