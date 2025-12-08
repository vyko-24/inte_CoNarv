// src/adapters/user/UserAdapter.js

export const UserAdapter = {
  // Transforma el JSON que viene dentro de "maid" a algo usable en React
  toModel: (data) => ({
    id: data.id,
    username: data.username,
    email: data.email,
    role: data.rol, // "ROLE_MAID"
    status: data.status,
    fcmToken: data.fcmToken,
  }),

  // Prepara el objeto para enviarlo de vuelta a Java (importante para la asignación)
  toDTO: (model) => {
    if (!model) return null;
    return {
      id: model.id,
      username: model.username,
      email: model.email,
      rol: model.role, // Java espera "rol"
      status: model.status
    };
  }
};