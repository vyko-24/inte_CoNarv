"use client"
import { useState, useContext } from "react"
import Alert from "../../components/Alert" 
import AuthContext from "../../context/authcontext"
import { loginService } from "../../services/auth/authservices"

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // ESTADO NUEVO: Mostrar/Ocultar contraseña
  const [showPassword, setShowPassword] = useState(false)

  const { dispatch } = useContext(AuthContext)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      const response = await loginService(formData)
      dispatch({ type: "LOGIN", payload: { user: response.user, token: response.token } })
    } catch (err) {
      setError("Error al iniciar sesión. Verifique sus credenciales.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">RomMila</h1>
            <p className="text-gray-600">Servicio de limpieza</p>
          </div>

          {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError("")} /></div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="usuario@hotel.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
              <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} // <--- CAMBIO DINÁMICO
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10" // pr-10 para dar espacio al icono
                    placeholder="••••••••"
                  />
                  
                  {/* BOTÓN OJO */}
                  <button
                    type="button" // IMPORTANTE: type="button" para no enviar form
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                        // Icono Ojo Abierto
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    ) : (
                        // Icono Ojo Cerrado
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.574-2.59M5.312 5.312l13.376 13.376M9.172 9.172a3 3 0 014.242 4.242" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.828 9.828l-2.828 2.828" />
                        </svg>
                    )}
                  </button>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition flex justify-center items-center"
              >
                {isLoading ? "Ingresando..." : "Entrar"}
              </button>
            </div>
          </form>
          <p className="text-center text-gray-500 text-xs mt-6 px-4">Si eres Camarera y olvidaste tus credenciales, contacta a Recepción.</p>
        </div>
      </div>
    </div>
  )
}