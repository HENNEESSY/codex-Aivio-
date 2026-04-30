import { createRootRoute, Outlet } from '@tanstack/react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { Toaster } from 'sonner';

export const Route = createRootRoute({
  component: () => (
    <>
      <AppLayout>
        <Outlet />
      </AppLayout>
      <CommandPalette />
      <Toaster 
        theme="dark" 
        toastOptions={{
          style: {
            background: '#0D2018',
            border: '1px solid rgba(0,200,83,0.25)',
            color: '#E8F5E9'
          }
        }} 
      />
    </>
  ),
});
