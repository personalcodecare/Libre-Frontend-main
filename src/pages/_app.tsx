import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';

import { store } from 'state/store';

import { Header, Footer, Layout } from 'components';
import 'styles/main.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Header />
      <Layout>
        <Component {...pageProps} />
        <Footer />
      </Layout>
      <div id="modal" />
    </Provider>
  );
}
export default MyApp;
