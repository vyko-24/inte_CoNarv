// src/services/rooms/roomService.js
import { RoomAdapter } from "../../adapters/room/RoomAdapter";
import AxiosClient from "../../interceptor/axiosclient";
import { AlertHelper } from "../../utilities/AlertHelper";
import { apiHandler } from "../apiHandler";

// --- LECTURA (GET) - Se mantienen con AxiosClient (SW Cache maneja el offline) ---

export const getAllRooms = async () => {
  try {
    const response = await AxiosClient.get("/room");
    
    if (response.data.status === "Ok") {
      return response.data.data.map(item => RoomAdapter.toModel(item));
    } else {
      throw new Error(response.data.message || "Error al obtener habitaciones");
    }
  } catch (error) {
    throw error;
  }
};

export const getRoomById = async (id) => {
    try {
        const response = await AxiosClient.get(`/room/${id}`);
        // Validamos estructura standard
        const data = response.data.data || response.data;
        return RoomAdapter.toModel(data);
    } catch (error) {
        throw error;
    }
};

// --- ESCRITURA (POST, PUT, PATCH, DELETE) - Usan apiHandler para Offline ---

export const createRoom = async (roomModel) => {
  try {
    const dto = RoomAdapter.toDTO(roomModel);
    
    // OFFLINE: Usamos apiHandler
    const response = await apiHandler("POST", "/room", dto);
    
    // Extraemos datos (sea respuesta real o simulada offline)
    const responseData = response.data.data || response.data;
    
    AlertHelper.showAlert("Habitación creada correctamente (o en cola)", "success");
    return RoomAdapter.toModel(responseData);
  } catch (error) {
    throw error;
  }
};

export const updateRoom = async (id, roomModel) => {
  try {
    const dto = RoomAdapter.toDTO(roomModel);
    
    // OFFLINE: Usamos apiHandler
    const response = await apiHandler("PUT", `/room/${id}`, dto);

    if (response.data.status === "Ok" || response.status === 200) {
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
    const today = new Date().toISOString().split('T')[0]; 
    const finalDateTime = selectedTime ? `${today}T${selectedTime}:00` : new Date().toISOString();

    // OFFLINE: apiHandler usualmente toma (method, url, body). 
    // Como esto es un Query Param, lo concatenamos a la URL.
    const response = await apiHandler("PATCH", `/room/cleanTime?cleanTime=${finalDateTime}`, null);

    AlertHelper.showAlert("Rutina diaria iniciada", "success");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changeRoomStatus = async (id, statusString) => {
  try {
    // OFFLINE: Usamos apiHandler
    const response = await apiHandler("PATCH", `/room/status/${id}/${statusString}`, null);
    
    AlertHelper.showAlert("Estado actualizado", "success");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteRoom = async (id) => {
  try {
      // OFFLINE: Usamos apiHandler
      await apiHandler("DELETE", `/room/${id}`, null);
      
      AlertHelper.showAlert("Habitación eliminada correctamente", "success");
      return true;
  } catch (error) {
      throw error;
  }
};