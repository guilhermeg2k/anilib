import { toast } from 'react-toastify';

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
