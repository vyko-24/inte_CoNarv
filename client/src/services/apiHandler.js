import AxiosClient from "../interceptor/axiosclient";
import { OfflineStorage } from "./offline/offlineStorage";

export const apiHandler = async (method, url, data) => {
    // Verificar red
    if (navigator.onLine) {
        // ONLINE: Petición normal
        try {
            const response = await AxiosClient({ method, url, data });
            // Retornamos la estructura que esperan tus adapters
            return response; 
        } catch (error) {
            throw error;
        }
    } else {
        // OFFLINE: Interceptar escritura
        if (method === 'GET') {
            // Dejar que Axios/ServiceWorker maneje el caché o falle
             const response = await AxiosClient({ method, url, data });
             return response;
        }

        // Si es POST/PUT/PATCH/DELETE -> Guardar en PouchDB
        await OfflineStorage.addToQueue({ method, url, data });
        
        // Retornar respuesta simulada exitosa
        return {
            data: {
                status: "Ok",
                data: data, // Devolvemos los mismos datos para "engañar" al UI y que actualice optimistamente
                message: "Operación guardada offline"
            },
            status: 200
        };
    }
};