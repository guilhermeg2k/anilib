import { LibraryStatus as LibraryStatusEnum } from '@backend/constants/libraryStatus';
import { WebsocketEvent } from '@backend/constants/websocketEvents';
import LibraryService from '@services/libraryService';
import socketIOClient from 'library/socketIOClient';
import { useEffect, useRef } from 'react';
import { Id, toast, Flip } from 'react-toastify';
import Spinner from './Spinner';

const TOAST_POSITION = 'bottom-right';
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
  const toastId = useRef<Id>();

  const showUpdatedToast = () => {
    if (toastId.current) {
      toast.update(toastId.current, {
        autoClose: 5000,
        render: <ToastContent text="Library Updated" />,
        type: toast.TYPE.SUCCESS,
        position: TOAST_POSITION,
        transition: TOAST_TRANSITION,
      });
    } else {
      toastId.current = toast(<ToastContent text="Library Updated" />, {
        autoClose: 5000,
        type: toast.TYPE.SUCCESS,
        position: TOAST_POSITION,
      });
    }
  };

  const showUpdatingToast = () => {
    if (toastId.current) {
      toast.update(toastId.current, {
        render: <ToastContent text="Updating Library" showSpinner />,
        autoClose: false,
        type: toast.TYPE.DEFAULT,
        closeButton: false,
        position: TOAST_POSITION,
        transition: TOAST_TRANSITION,
      });
    } else {
      toastId.current = toast(
        <ToastContent text="Updating Library" showSpinner />,
        {
          autoClose: false,
          type: toast.TYPE.DEFAULT,
          closeButton: false,
          position: TOAST_POSITION,
        }
      );
    }
  };

  const showFailedToast = () => {
    if (toastId.current) {
      toast.update(toastId.current, {
        render: <ToastContent text="Failed to update library" />,
        autoClose: 5000,
        type: toast.TYPE.ERROR,
        position: TOAST_POSITION,
        transition: TOAST_TRANSITION,
      });
    } else {
      toastId.current = toast(
        <ToastContent text="Failed to update library" />,
        {
          autoClose: 5000,
          type: toast.TYPE.ERROR,
          position: TOAST_POSITION,
        }
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
