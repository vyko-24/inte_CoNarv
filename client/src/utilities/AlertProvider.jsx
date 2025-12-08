"use client"

import { createContext, useContext, useState, useCallback } from "react"

const AlertContext = createContext()
export const useAlert = () => useContext(AlertContext)

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null)

  const showAlert = useCallback((message, type = "info", duration) => {
    setAlert({ message, type })
    setTimeout(() => {
      setAlert(null)
    }, duration)
  }, [])

  const severityStyles = {
    success: "bg-green-600 text-white border-l-4 border-green-400",
    info: "bg-blue-600 text-white border-l-4 border-blue-400",
    warning: "bg-yellow-500 text-black border-l-4 border-yellow-300",
    error: "bg-red-600 text-white border-l-4 border-red-400",
  }

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <div
          className={`fixed top-5 right-5 px-6 py-4 rounded-lg shadow-2xl z-50 transition-all duration-300 transform translate-x-0 ${severityStyles[alert.type]} max-w-md`}
        >
          <div className="flex items-center">
            <div className="flex-1">
              <p className="font-semibold text-sm">{alert.message}</p>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  )
}
