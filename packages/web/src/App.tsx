import { fetchAuthSession } from '@aws-amplify/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpLink } from '@trpc/client';
import { Amplify } from 'aws-amplify';
import { MathJaxContext } from 'better-react-mathjax';
import { ReactElement, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { pdfjs } from 'react-pdf';

import { AppRoutes } from './components/navigation';
import { Toaster } from './components/ui';
import { frenchMessages, trpc } from './lib';

export const App = (): ReactElement => {
  const [queryClient] = useState(() => new QueryClient());

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: import.meta.env.VITE_APP_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_APP_USER_POOL_CLIENT_ID,
        loginWith: { email: true },
        passwordFormat: { minLength: 8 },
      },
    },
    API: {
      REST: {
        api: {
          endpoint: import.meta.env.VITE_APP_API_URL,
          region: import.meta.env.VITE_APP_REGION,
        },
      },
    },
  });

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpLink({
          url: `${import.meta.env.VITE_APP_API_URL}`,
          headers: async () => {
            const { tokens } = await fetchAuthSession();

            if (tokens?.idToken === undefined) {
              return {};
            }

            return {
              Authorization: `Bearer ${tokens.idToken.toString()}`,
            };
          },
        }),
      ],
    }),
  );

  const mathJaxConfig = {
    loader: { load: ['[tex]/html', '[tex]/color'] },
    tex: {
      packages: { '[+]': ['html', 'color'] },
      inlineMath: [
        ['$$', '$$'],
        ['\\(', '\\)'],
      ],
      displayMath: [['\\[', '\\]']],
    },
  };

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <IntlProvider messages={frenchMessages} locale="fr" defaultLocale="fr">
          <MathJaxContext
            renderMode="post"
            hideUntilTypeset="first"
            config={mathJaxConfig}
            version={3}
            src="/es5/tex-mml-chtml.js"
          >
            <AppRoutes />
            <Toaster />
          </MathJaxContext>
        </IntlProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};
