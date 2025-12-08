"use client"

export default function Alert({ type = "info", title, message, onClose }) {
  const bgColors = {
    error: "bg-red-50 border-red-200",
    success: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
  }

  const textColors = {
    error: "text-red-800",
    success: "text-green-800",
    warning: "text-yellow-800",
    info: "text-blue-800",
  }

  return (
    <div className={`${bgColors[type]} border rounded-lg p-4 mb-4`}>
      <div className="flex justify-between">
        <div>
          {title && <p className={`font-semibold ${textColors[type]}`}>{title}</p>}
          {message && <p className={`text-sm ${textColors[type]}`}>{message}</p>}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
