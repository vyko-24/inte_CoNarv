"use client"

import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import { AlertProvider, useAlert } from './utilities/AlertProvider.jsx'
import { AlertHelper } from './utilities/AlertHelper.js'
import AuthProvider from './context/AuthProvider.jsx'



const InitAlert = () => {
  const alert = useAlert()
  useEffect(() => {
    AlertHelper.initialize(alert)
  }, [alert])
  return null
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AlertProvider>
        <InitAlert />
        <App />
      </AlertProvider>
    </AuthProvider>
  </StrictMode>,
)
