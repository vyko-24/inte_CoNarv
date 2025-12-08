import axios from "axios"
import { AlertHelper } from "../utilities/AlertHelper"

const SERVER_URL = import.meta.env.VITE_APP_SERVER_URL || "http://localhost:8080"

export const AxiosClient = axios.create({
  baseURL: SERVER_URL,
  withCredentials: false,
})

AxiosClient.interceptors.request.use(
  (request) => {
    if (request.data instanceof FormData) {
      // El content-type lo pone Axios solo
    } else {
      request.headers["Content-Type"] = "application/json"
    }
    request.headers["Accept"] = "application/json"
    request.headers["Access-Control-Allow-Origin"] = "*"

    const session = localStorage.getItem("token") || null
    if (session) {
      request.headers["Authorization"] = `Bearer ${session}`
    }
    return request
  },
  (error) => {
    AlertHelper.showAlert("Error in request: " + error.message, "error")
    return Promise.reject(error)
  },
)

AxiosClient.interceptors.response.use(
  (response) => {
    // Remove automatic success alert - let services handle their own alerts
    return response
  },
  (error) => {
    console.log("log en axios", error)

    let message = "Ocurrió un error inesperado."

    if (error.response && error.response.data) {
      const data = error.response.data

      // CASO 1: Si data es el string extraño que muestra tu imagen
      if (typeof data === "string" && data.includes("message=")) {
        // Intentamos extraer lo que hay después de "message=" y antes de la coma o el cierre
        // Regex busca: message=(cualquier cosa) hasta encontrar ", status" o el final "}"
        const match = data.match(/message=(.*?)(?:,\s*status|}$)/)
        
        if (match && match[1]) {
          message = match[1]
        } else {
          // Si falla el regex, mostramos el string limpiando las llaves
          message = data.replace("{", "").replace("}", "")
        }
      } 
      // CASO 2: Si el backend algún día devuelve JSON real ({ message: "..." })
      else if (typeof data === "object" && data.message) {
        message = data.message
      }
      // CASO 3: Fallback
      else {
        message = typeof data === "string" ? data : JSON.stringify(data)
      }
    }

    AlertHelper.showAlert(message, "error")
    return Promise.reject(error)
  },
)

export default AxiosClient
