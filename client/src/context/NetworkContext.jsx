import React, { createContext, useState, useEffect } from 'react';
import AxiosClient from '../interceptor/axiosclient';
import { OfflineStorage } from '../services/offline/offlineStorage';
import { toast } from 'react-hot-toast'; // O tu componente Alert

const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    // 1. Detectar cambios de red
    useEffect(() => {
        const updateStatus = () => {
            const status = navigator.onLine;
            setIsOnline(status);
            if (status) {
                syncData(); // ¡Volvió internet! A sincronizar.
            }
        };

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        
        // Carga inicial del contador
        updatePendingCount();

        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
        };
    }, []);

    const updatePendingCount = async () => {
        const count = await OfflineStorage.getCount();
        setPendingCount(count);
    };

    // 2. Lógica de Sincronización (Lo complejo)
    const syncData = async () => {
        const pendingItems = await OfflineStorage.getPendingItems();
        if (pendingItems.length === 0) return;

        setIsSyncing(true);
        toast.loading("Sincronizando datos guardados...");

        for (const item of pendingItems) {
            try {
                // Reconstruir la petición original
                await AxiosClient({
                    method: item.method,
                    url: item.url,
                    data: item.data,
                    // headers: item.headers // Si necesitas headers específicos
                });

                // Si tiene éxito, borrar de PouchDB
                await OfflineStorage.removeItem(item);
            } catch (error) {
                console.error("Fallo al sincronizar item", item._id, error);
                // Si falla por error 500 o validación, quizás deberías borrarlo o moverlo a una lista de "errores"
                // Si falla por red, se queda ahí para el próximo intento.
            }
        }

        await updatePendingCount();
        setIsSyncing(false);
        toast.dismiss();
        toast.success("Sincronización completada");
    };

    // 3. Función Interceptora (Wrapper para tus servicios)
    // Esta función reemplaza la llamada directa a Axios en tus servicios
    const executeRequest = async (method, url, data) => {
        if (navigator.onLine) {
            // Camino Feliz: Hay internet
            try {
                const response = await AxiosClient({ method, url, data });
                return { success: true, data: response.data };
            } catch (error) {
                throw error;
            }
        } else {
            // Camino Triste: No hay internet -> Guardar en PouchDB
            if (method === 'GET') {
                // Los GET no se guardan en PouchDB, se sirven del SW Cache o fallan
                return { success: false, error: "offline_view_only" };
            }

            const saved = await OfflineStorage.addToQueue({ method, url, data });
            await updatePendingCount();
            
            if (saved) {
                // Simulamos éxito para que la UI no explote
                return { 
                    success: true, 
                    data: { message: "Guardado offline. Se enviará al conectar." },
                    isOfflineSaved: true 
                };
            } else {
                throw new Error("No se pudo guardar localmente (Límite excedido)");
            }
        }
    };

    return (
        <NetworkContext.Provider value={{ isOnline, pendingCount, isSyncing, executeRequest }}>
            {children}
            
            {/* Banner Global de Estado */}
            {!isOnline && (
                <div className="fixed bottom-16 left-0 right-0 bg-gray-800 text-white text-xs py-1 px-4 text-center z-50 opacity-90">
                    📡 Modo Offline - Los cambios se guardarán localmente ({pendingCount} pendientes)
                </div>
            )}
             {isSyncing && (
                <div className="fixed bottom-16 left-0 right-0 bg-blue-600 text-white text-xs py-1 px-4 text-center z-50 animate-pulse">
                    🔄 Sincronizando datos con el servidor...
                </div>
            )}
        </NetworkContext.Provider>
    );
};

export default NetworkContext;