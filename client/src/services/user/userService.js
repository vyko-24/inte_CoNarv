import { UserAdapter } from "../../adapters/useradapter";
import AxiosClient from "../../interceptor/axiosclient";
import { AlertHelper } from "../../utilities/AlertHelper";

export const getAllUsers = async () => {
  try {
    const response = await AxiosClient.get("/user");
    const dataList = response.data.data || [];
    return dataList.map((user) => UserAdapter.toModel(user));
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    // Convertimos el modelo de UI a DTO para el backend
    const dto = UserAdapter.toDTO(userData);
    const response = await AxiosClient.put(`/user/${id}`, dto);
    // Asumimos que retorna el usuario actualizado en data.data o data
    const responseData = response.data.data || response.data; 
    AlertHelper.showAlert("Usuario actualizado correctamente", "success");
    return UserAdapter.toModel(responseData);
  } catch (error) {
    throw error;
  }
};

// NUEVA FUNCIÓN
export const changeUserStatus = async (id) => {
  try {
    const response = await AxiosClient.patch(`/user/status/${id}`);
    AlertHelper.showAlert("Estado del usuario actualizado correctamente", "success");
    return response.data; // Retorna mensaje de éxito
  } catch (error) {
    throw error;
  }
};