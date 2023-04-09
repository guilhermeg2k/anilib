import LibraryStatus from '@components/library-status';
import axiosClient from 'library/axios';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import '../styles/globals.css';
import { trpc } from '@utils/trpc';

function MyApp({ Component, pageProps }: AppProps) {
  const startWebSocketServer = async () => {
    await axiosClient.get('ws/');
  };

  useEffect(() => {
    startWebSocketServer();
  }, []);

  return (
    <>
      <LibraryStatus />
      <ToastContainer />
      <Component {...pageProps}></Component>
    </>
  );
}

export default trpc.withTRPC(MyApp);
