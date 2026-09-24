import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { DevTools } from '@/app/DevTools';
import { QueryProvider } from '@/app/QueryProvider';

export function RootLayout() {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-gray-50 overflow-hidden">
        <Outlet />
        <DevTools />
        <Toaster
          // ponytail: read once per render; a manual theme toggle updates toasts on next reload
          theme={
            document.documentElement.classList.contains('dark')
              ? 'dark'
              : 'light'
          }
          richColors
          position="top-right"
          expand={true}
          visibleToasts={5}
          closeButton={true}
          toastOptions={{
            style: {
              fontSize: '14px',
            },
            className: 'whitespace-pre-line', // Allow line breaks in error messages
          }}
        />
      </div>
    </QueryProvider>
  );
}
