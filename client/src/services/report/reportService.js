import AxiosClient from "../../interceptor/axiosclient";
import { ReportAdapter } from "../../adapters/report/ReportAdapter";

export const getAllReports = async () => {
  try {
    const response = await AxiosClient.get("/report");
    // Tu estructura es { data: [...], status: "Ok" }
    const dataList = response.data.data || [];
    return dataList.map(item => ReportAdapter.toModel(item));
  } catch (error) {
    console.error("Error get reports:", error);
    throw error;
  }
};

export const getReportsByRoom = async (roomId) => {
    try {
      const response = await AxiosClient.get(`/report/room/${roomId}`);
      const dataList = response.data.data || [];
      return dataList.map(item => ReportAdapter.toModel(item));
    } catch (error) {
      throw error;
    }
  };

// Opcional para editar el texto del reporte
export const updateReport = async (id, reportModel) => {
  try {
    const formData = ReportAdapter.toFormData(reportModel);
    const response = await AxiosClient.put(`/report/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    // Ajustar según qué devuelva tu update
    return response.data; 
  } catch (error) {
    throw error;
  }
};

export const createReport = async (reportModel) => {
  try {
    console.log("data de vista", reportModel);
    
    const formData = ReportAdapter.toFormData(reportModel);
    console.log("data de crear reporte",formData);
    
    const response = await AxiosClient.post("/report", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return ReportAdapter.toModel(response.data);
  } catch (error) {
    throw error;
  }
};