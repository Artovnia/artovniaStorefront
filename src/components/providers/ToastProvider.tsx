"use client"

import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          style: {
            background: '#4CAF50',
            color: '#fff',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#F44336',
            color: '#fff',
          },
        },
      }}
    />
  )
}
