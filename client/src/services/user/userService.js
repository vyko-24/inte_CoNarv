import { UserAdapter } from "../../adapters/useradapter";
import AxiosClient from "../../interceptor/axiosclient";
import { AlertHelper } from "../../utilities/AlertHelper";
import { apiHandler } from "../apiHandler";

// LECTURA (GET) - Se mantiene con AxiosClient (SW Cache maneja el offline)
export const getAllUsers = async () => {
  try {
    const response = await AxiosClient.get("/user");
    // Ajusta si tu backend devuelve { data: [...] } o directo [...]
    const dataList = response.data.data || response.data;
    return dataList.map((user) => UserAdapter.toModel(user));
  } catch (error) {
    throw error;
  }
};

// CREAR (POST) - Offline
export const createUser = async (userModel) => {
  try {
    // Para crear, necesitamos mandar el DTO con rol, email, username
    const dto = UserAdapter.toDTO(userModel);
    
    // Usamos apiHandler para soporte offline
    const response = await apiHandler("POST", "/user", dto);
    
    // Extraemos los datos de la respuesta (sea real o simulada offline)
    const responseData = response.data.data || response.data;
    
    AlertHelper.showAlert("Usuario creado correctamente", "success");
    return UserAdapter.toModel(responseData);
  } catch (error) {
    throw error;
  }
};

// ACTUALIZAR (PUT) - Offline
export const updateUser = async (id, userData) => {
  try {
    const dto = UserAdapter.toDTO(userData);
    
    const response = await apiHandler("PUT", `/user/${id}`, dto);
    
    const responseData = response.data.data || response.data; 
    AlertHelper.showAlert("Usuario actualizado correctamente", "success");
    return UserAdapter.toModel(responseData);
  } catch (error) {
    throw error;
  }
};

// CAMBIAR ESTADO (PATCH) - Offline
export const changeUserStatus = async (id) => {
  try {
    // apiHandler espera (method, url, data). Enviamos null en data para el PATCH
    const response = await apiHandler("PATCH", `/user/status/${id}`, null);
    
    AlertHelper.showAlert("Estado del usuario actualizado", "success");
    return response.data;
  } catch (error) {
    throw error;
  }
};