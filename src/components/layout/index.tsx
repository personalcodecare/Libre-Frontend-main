import { ReactNode, FC, useEffect } from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql,
  defaultDataIdFromObject,
} from '@apollo/client';

import { useUserFacade } from 'state';

type LayoutProps = {
  children: ReactNode;
};

export const Layout: FC<LayoutProps> = ({ children }) => {
  const { updateUserInfo, userState } = useUserFacade();
  const { chain } = userState;
  const { theme } = userState;

  const cache = new InMemoryCache({
    dataIdFromObject(responseObject) {
      switch (responseObject.__typename) {
        case 'Token':
          return `${responseObject.id}${responseObject.derivedUSD}`;
        case 'Pair':
          return `${responseObject.id}${responseObject.volumeUSD}`;
        default:
          return defaultDataIdFromObject(responseObject);
      }
    },
  });

  const client = new ApolloClient({
    uri:
      chain === 'BSC'
        ? 'https://api.thegraph.com/subgraphs/name/libre-defi/libre-bsc-exchange-subgraph'
        : chain === 'AVAX'
        ? 'https://api.thegraph.com/subgraphs/name/libre-defi/libre-exchange-avalanche-subgraph'
        : 'https://api.thegraph.com/subgraphs/name/libre-defi/libre-exchange-polygon-subgraph',
    cache,
  });

  useEffect(() => {
    if (
      !localStorage.libre_theme ||
      localStorage.libre_theme === 'dark' ||
      (!('libre_theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      updateUserInfo({ theme: 'dark' });
    } else {
      updateUserInfo({ theme: 'light' });
    }
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.libre_theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.libre_theme = 'dark';
    }
  }, [theme]);

  return (
    <ApolloProvider client={client}>
      <div className="page-layout flex flex-col justify-between">
        {children}
      </div>
    </ApolloProvider>
  );
};
