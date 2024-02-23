import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster
        toastOptions={{
          unstyled: true,
          classNames: {
            success: 'flex items-center flex-wrap gap-1.5 bg-zinc-900 text-teal-400 rounded-xl p-5 w-[320px] max-w-[320px]'
          },
          duration: 3000
        }}
      />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
