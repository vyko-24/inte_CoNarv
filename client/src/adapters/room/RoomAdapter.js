// src/adapters/room/RoomAdapter.js
import { UserAdapter } from "../useradapter";

export const RoomAdapter = {
  // 1. De Backend (JSON) -> Frontend (React)
  toModel: (data) => ({
    id: data.id,
    number: data.number,       // "A-01"
    status: data.status,       // "STATUS_CLEAN", "STATUS_BLOCKED", etc.
    cleanTime: data.cleanTime, // "2025-12-05T..."
    
    // Usamos el UserAdapter para procesar a la camarera si existe
    maid: data.maid ? UserAdapter.toModel(data.maid) : null,

    // Mapeamos los reportes si existen (extraemos lo básico para la vista de lista)
    report: Array.isArray(data.report) ? data.report.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      // Si "imagenes" viene vacío o nulo, ponemos array vacío
      images: r.imagenes || [] 
    })) : []
  }),

  // 2. De Frontend -> Backend (RoomDTO para el PUT)
  toDTO: (model) => {
    return {
      id: model.id,
      number: model.number,
      status: model.status,
      // Java espera el objeto Maid completo o null
      maid: model.maid ? UserAdapter.toDTO(model.maid) : null
    };
  }
};