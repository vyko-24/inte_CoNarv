// src/services/room/roomService.js
import { RoomAdapter } from "../../adapters/room/RoomAdapter";
import AxiosClient from "../../interceptor/axiosclient";
import { AlertHelper } from "../../utilities/AlertHelper";
import { apiHandler } from "../apiHandler";

export const getAllRooms = async () => {
  try {
    const response = await AxiosClient.get("/room");
    
    // Validamos que la respuesta sea exitosa según tu estructura
    if (response.data.status === "Ok") {
        
      // Mapeamos el array que está en response.data.data
      return response.data.data.map(item => RoomAdapter.toModel(item));
    } else {
      throw new Error(response.data.message || "Error al obtener habitaciones");
    }
  } catch (error) {
    throw error;
  }
};

export const updateRoom = async (id, roomModel) => {
  try {
    const dto = RoomAdapter.toDTO(roomModel);
    // PUT /room/{id}
    console.log(dto);
    
    const response = await AxiosClient.put(`/room/${id}`, dto);
    

    // Asumimos que el PUT también devuelve la estructura estandar { data: {...}, status: "Ok" }
    if (response.data.status === "Ok" || response.status === 200) {
        // A veces el update devuelve el objeto suelto o dentro de data, ajusta según tu backend
        const responseData = response.data.data || response.data;
        AlertHelper.showAlert("Habitación actualizada correctamente", "success");
        return RoomAdapter.toModel(responseData);
    }
    
  } catch (error) {
    throw error;
  }
};

export const updateCleanTime = async (selectedTime) => {
  try {
    // Si el usuario no manda hora, usa la actual.
    // Combinamos la fecha de hoy con la hora seleccionada
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const finalDateTime = selectedTime ? `${today}T${selectedTime}:00` : new Date().toISOString();

    const response = await AxiosClient.patch(`/room/cleanTime`, null, {
        params: { cleanTime: finalDateTime }
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};



export const createRoom = async (roomModel) => {
  try {
    const dto = RoomAdapter.toDTO(roomModel);
    
    // CAMBIO AQUÍ: Usamos apiHandler en vez de AxiosClient.post
    const response = await apiHandler("POST", "/room", dto);
    
    // Manejo de la respuesta simulada
    const responseData = response.data.data || response.data;
    
    // Si estamos offline, responseData será el mismo DTO que enviamos.
    // El Adapter debe ser capaz de manejarlo.
    return RoomAdapter.toModel(responseData);
  } catch (error) {
    throw error;
  }
};



// CAMBIAR ESTADO (PATCH)
export const changeRoomStatus = async (id, statusString) => {
  try {
    // Endpoint: /api/room/status/{id}/{status}
    console.log("id", id, "  status", statusString);
    
    const response = await AxiosClient.patch(`/room/status/${id}/${statusString}`);
    AlertHelper.showAlert("Estado de la habitación actualizado correctamente", "success");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ELIMINAR
export const deleteRoom = async (id) => {
  try {
      await AxiosClient.delete(`/room/${id}`);
        AlertHelper.showAlert("Habitación eliminada correctamente", "success");
      return true;
  } catch (error) {
      throw error;
  }
};

//metodo get by id para la maid
export const getRoomById = async (id) => {
    try {
        const response = await AxiosClient.get(`/room/${id}`);
        const data = response.data.data || response.data;
        return RoomAdapter.toModel(data);
    } catch (error) {
        throw error;
    }
};