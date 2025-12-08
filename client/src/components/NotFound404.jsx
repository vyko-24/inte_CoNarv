import { Link } from "react-router-dom"
import { Home, AlertTriangle } from "lucide-react"

const NotFound404 = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <AlertTriangle className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
          <h1 className="mafia-title text-6xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-4">Esta página no está en nuestro territorio</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            Parece que te has perdido en las calles. Esta página no existe o ha sido movida a otro lugar.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center space-x-2 mafia-button px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-200 hover:transform hover:scale-105"
        >
          <Home className="w-5 h-5" />
          <span>Volver al Cuartel General</span>
        </Link>
      </div>
    </div>
  )
}

export default NotFound404
