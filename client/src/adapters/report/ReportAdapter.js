import { RoomAdapter } from "../room/RoomAdapter";

export const ReportAdapter = {
  // 1. De Backend (JSON) -> Frontend (Model)
  toModel: (data) => ({
    id: data.id,
    title: data.title,
    description: data.description,
    // Mapeamos la habitación anidada. OJO: El JSON dice "roomsAsigned"
    room: data.roomsAsigned ? RoomAdapter.toModel(data.roomsAsigned) : null,
    // Manejo seguro de imágenes
    images: Array.isArray(data.imagenes) ? data.imagenes.map(img => ({
      id: img.id,
      url: img.url // Asumimos que la entidad Image tiene url, ajusta si es base64
    })) : []
  }),

  // 2. De Frontend -> Backend (FormData)
  // IMPORTANTE: Tu controlador usa @RequestParam y @RequestPart
  toFormData: (model) => {    
    const formData = new FormData();
    
    formData.append("title", model.title);
    formData.append("description", model.description);
    // Tu controlador pide 'roomId' como RequestParam
    if (model.roomId) {
        formData.append("roomId", model.roomId);
    }

    // Manejo de Archivos (Array de Files del input type="file")
    // Tu controlador espera @RequestPart("imagenes") List<MultipartFile>
    if (model.imagesFiles && model.imagesFiles.length > 0) {
      model.imagesFiles.forEach((file) => {
        formData.append("imagenes", file); 
      });
    }
    console.log("formdata de modelo", formData);
    

    return formData;
  }
};