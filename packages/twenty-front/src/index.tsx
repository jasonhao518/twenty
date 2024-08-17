import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { RecoilRoot } from 'recoil';
import { IconsProvider } from 'twenty-ui';

import { CaptchaProvider } from '@/captcha/components/CaptchaProvider';
import { ApolloDevLogEffect } from '@/debug/components/ApolloDevLogEffect';
import { RecoilDebugObserverEffect } from '@/debug/components/RecoilDebugObserver';
import { AppErrorBoundary } from '@/error-handler/components/AppErrorBoundary';
import { ExceptionHandlerProvider } from '@/error-handler/components/ExceptionHandlerProvider';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

import '@emotion/react';

import { App } from './App';

import './index.css';
import 'react-loading-skeleton/dist/skeleton.css';

import { CopilotKit } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') ?? document.body,
);

root.render(
  <RecoilRoot>
    <AppErrorBoundary>
      <CaptchaProvider>
        <RecoilDebugObserverEffect />
        <ApolloDevLogEffect />
        <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
          <IconsProvider>
            <ExceptionHandlerProvider>
              <HelmetProvider>
                <CopilotKit
                  runtimeUrl={
                    (process.env.REACT_APP_SERVER_BASE_URL ??
                      'http://localhost:3000') + '/api/copilotkit'
                  }
                >
                  <CopilotSidebar
                    labels={{
                      title: 'Your Assistant',
                      initial: 'Hi! 👋 How can I assist you today?',
                    }}
                  >
                    <App />
                  </CopilotSidebar>
                </CopilotKit>
              </HelmetProvider>
            </ExceptionHandlerProvider>
          </IconsProvider>
        </SnackBarProviderScope>
      </CaptchaProvider>
    </AppErrorBoundary>
  </RecoilRoot>,
);
