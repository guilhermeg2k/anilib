import { toast, ToastContainer } from 'react-toastify';

export const toastError = (message: string) => {
  toast(message, {
    type: 'error',
    autoClose: 2000,
  });
};

export const toastSuccess = (message: string) => {
  toast(message, {
    type: 'success',
    autoClose: 2000,
  });
};

export const toastPromise = (
  promise: Promise<unknown>,
  messages: {
    pending: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, messages, { autoClose: 2000 });
};
