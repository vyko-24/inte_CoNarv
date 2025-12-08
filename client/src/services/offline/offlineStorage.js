import Dexie from 'dexie';

// 1. Crear la base de datos
const db = new Dexie('RomMilaDB');

// 2. Definir el esquema (tablas)
// '++id' significa autoincrementable (como una SQL Primary Key)
db.version(1).stores({
  sync_queue: '++id, method, url, status, timestamp' 
});

const QUEUE_LIMIT = 50; 

export const OfflineStorage = {
    // Guardar petición
    addToQueue: async (requestData) => {
        try {
            // Verificar límite
            const count = await db.sync_queue.count();
            if (count >= QUEUE_LIMIT) {
                // Borrar el más antiguo (el que tenga menor ID)
                const firstItem = await db.sync_queue.orderBy('id').first();
                if (firstItem) {
                    await db.sync_queue.delete(firstItem.id);
                }
            }

            // Guardar
            await db.sync_queue.add({
                ...requestData, // { url, method, data }
                timestamp: new Date().toISOString(),
                status: 'pending'
            });
            return true;
        } catch (error) {
            console.error("Error guardando en Dexie:", error);
            return false;
        }
    },

    // Obtener pendientes
    getPendingItems: async () => {
        try {
            return await db.sync_queue.toArray();
        } catch (error) {
            console.error("Error leyendo Dexie:", error);
            return [];
        }
    },

    // Borrar item procesado
    removeItem: async (item) => {
        try {
            if (item.id) {
                await db.sync_queue.delete(item.id);
            }
        } catch (error) {
            console.error("Error borrando de Dexie:", error);
        }
    },
    
    // Contar
    getCount: async () => {
        try {
            return await db.sync_queue.count();
        } catch (error) {
            return 0;
        }
    }
};