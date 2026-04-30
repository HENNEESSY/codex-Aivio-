import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkspaceProvider } from './lib/workspace/workspace-context';
import './index.css';

// Import all routes safely
import { Route as RootRoute } from './routes/__root';
import { Route as IndexRoute } from './routes/index';
import { Route as InboxRoute } from './routes/inbox';
import { Route as ClientsRoute } from './routes/clients';
import { Route as AgentsRoute } from './routes/agents';
import { Route as FinanceRoute } from './routes/finance';
import { Route as IntegrationsRoute } from './routes/integrations';
import { Route as TemplatesRoute } from './routes/templates';
import { Route as SettingsRoute } from './routes/settings';
import { Route as AutomationsRoute } from './routes/automations';

// Create route tree
const routeTree = RootRoute.addChildren([
  IndexRoute,
  InboxRoute,
  ClientsRoute,
  AgentsRoute,
  FinanceRoute,
  IntegrationsRoute,
  TemplatesRoute,
  SettingsRoute,
  AutomationsRoute
]);

const router = createRouter({ routeTree });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
    },
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WorkspaceProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </WorkspaceProvider>
  </StrictMode>,
);
