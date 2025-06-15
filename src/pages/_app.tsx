import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { Toaster } from '@/components/ui/toaster';
import { HMSRoomProvider } from '@100mslive/react-sdk';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <HMSRoomProvider>
      <Component {...pageProps} />
      <Toaster />
    </HMSRoomProvider>
  );
}

export default MyApp;