import LibraryStatus from '@components/library-status';
import type { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import '../styles/globals.css';
import { trpc } from '@utils/trpc';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <LibraryStatus />
      <ToastContainer />
      <Component {...pageProps}></Component>
    </>
  );
}

export default trpc.withTRPC(MyApp);
