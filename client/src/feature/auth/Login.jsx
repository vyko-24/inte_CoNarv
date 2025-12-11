"use client"

import { useState, useContext } from "react"
// Asegúrate de que la ruta a tu componente Alert sea correcta
import Alert from "../../components/Alert" 
import AuthContext from "../../context/authcontext"
import { loginService } from "../../services/auth/authservices"

export default function Login() {
  // 1. Estados para manejo de datos y UI
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("") // Estado para el mensaje de la Alerta
  const [isLoading, setIsLoading] = useState(false)

  // 2. Consumir el Contexto de Autenticación
  const { dispatch } = useContext(AuthContext)

  // 3. Manejador de cambios en los inputs (Genérico)
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Limpiamos el error si el usuario empieza a escribir de nuevo
    if (error) setError("")
  }

  // 4. Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("") // Limpiar errores previos

    try {
      // Llamada al servicio
      const response = await loginService(formData)
      // Actualizar el estado global de la app
      dispatch({
        type: "LOGIN",
        payload: {
          user: response.user,
          token: response.token,
        },
      })
      

    } catch (err) {
      const msg =  "Error al iniciar sesión. Verifique sus credenciales."
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          
          {/* Header del Login */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Hola Papu :V</h1>
            <p className="text-gray-600">Servicio de limpieza</p>
          </div>

          {/* Componente de Alerta (Solo se muestra si hay error) */}
          {error && (
            <div className="mb-4">
               <Alert type="error" message={error} onClose={() => setError("")} />
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Campo Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email" // Importante para el handleChange
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="usuario@hotel.com"
              />
            </div>

            {/* Campo Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password" // Importante para el handleChange
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Botón Submit */}
            <div className="space-y-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ingresando...
                  </>
                ) : (
                  "Entrar"
                )}
              </button>
            </div>
          </form>

          {/* Footer Informativo */}
          <p className="text-center text-gray-500 text-xs mt-6 px-4 leading-relaxed">
            Si eres Camarera y olvidaste tus credenciales, contacta a Recepción.
          </p>
        </div>
      </div>
    </div>
  )
}