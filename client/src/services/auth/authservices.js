import AxiosClient from "../../interceptor/axiosclient";
import { AlertHelper } from "../../utilities/AlertHelper";


export const loginService = async (credentials) => {
    try {
        const response = await AxiosClient({
            method: "POST",
            url: "/auth/login",
            data: credentials,
        });
        if (response.status === 200) {
            AlertHelper.showAlert("Inicio de sesión exitoso", "success");
            return response.data.data;
        }
    } catch (error) {
        throw error;
    }
}

export const updateFcmTokenService = async (userId, token) => {
  try {
    console.log("user",userId,"token",token);
    
    const response = await AxiosClient.post("/auth/update-fcm-token", null, {
        params: { userId, token }
    });
    return response.data;
  } catch (error) {
    console.error("Error actualizando token FCM", error);
  }
};