import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoomById, changeRoomStatus } from "../../../services/rooms/roomService";
import { createReport } from "../../../services/report/reportService";
import SpinnerLazy from "../../../utilities/SpinnerLazy";
import Alert from "../../../components/Alert";
import { AlertHelper } from "../../../utilities/AlertHelper";

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- ESTADOS ---
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Estados del Formulario
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ title: "", description: "" });
  
  // MEJORA: Arrays para manejar múltiples imágenes
  const [reportImages, setReportImages] = useState([]); 
  const [imagePreviews, setImagePreviews] = useState([]);
  
  const [sendingReport, setSendingReport] = useState(false);

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const fetchRoom = async () => {
    try {
      setLoading(true);
      const data = await getRoomById(id);
      setRoom(data);
    } catch (err) {
      setError("No se pudo cargar la habitación.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkClean = async () => {
    if (!window.confirm("¿Confirmas que la habitación está lista?")) return;
    
    try {
        setLoading(true);
        if (!navigator.onLine) {
            AlertHelper.showAlert("Estás sin conexión", "info");
            navigate(-1);
            return;
        }

        await changeRoomStatus(room.id, "STATUS_CLEAN");
        setSuccessMsg("¡Habitación marcada como LIMPIA!");
        setTimeout(() => navigate("/"), 1500);
        
    } catch (err) {
        setError("Error al actualizar estado.");
        setLoading(false);
    }
  };

  // --- LÓGICA DE FOTOS (MEJORADA) ---
  
  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // MEJORA: Límite de 3 fotos
    if (reportImages.length >= 3) {
        AlertHelper.showAlert("Máximo 3 fotos permitidas", "warning");
        return;
    }

    // Agregar al array existente
    setReportImages([...reportImages, file]);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
    };
    reader.readAsDataURL(file);

    // Resetear input para permitir subir la misma foto si se borró
    e.target.value = null; 
  };

  const handleRemoveImage = (indexToRemove) => {
    // MEJORA: Filtrar arrays para borrar la foto específica
    setReportImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setSendingReport(true);

    try {
        const reportModel = {
            title: reportForm.title || "Incidencia General",
            description: reportForm.description,
            roomId: room.id,
            imagesFiles: reportImages // Enviamos el array completo
        };

        if (!navigator.onLine) {
            const pendingReports = JSON.parse(localStorage.getItem("offline_reports") || "[]");
            pendingReports.push({ ...reportModel, imagesFiles: null, offline: true });
            localStorage.setItem("offline_reports", JSON.stringify(pendingReports));
            
            AlertHelper.showAlert("Sin conexión. Guardado localmente.", "info");
            setIsReportOpen(false);
            navigate("/");
            return;
        }

        await createReport(reportModel);
        AlertHelper.showAlert("Reporte enviado con éxito", "success");

        // Limpieza total
        setIsReportOpen(false);
        setReportImages([]);
        setImagePreviews([]);
        setReportForm({ title: "", description: "" });
        fetchRoom(); 
    } catch (err) {
        console.error(err);
        AlertHelper.showAlert("Error al enviar reporte", "error");
    } finally {
        setSendingReport(false);
    }
  };

  const getStatusStyles = (status) => {
    const s = status ? status.toUpperCase() : "";
    if (s.includes("CLEAN")) return "text-green-600 bg-green-100 border-green-200";
    if (s.includes("DIRTY") || s.includes("OCCUPIED")) return "text-yellow-600 bg-yellow-100 border-yellow-200";
    if (s.includes("BLOCKED")) return "text-red-600 bg-red-100 border-red-200";
    return "text-gray-600 bg-gray-100";
  };

  if (loading) return <SpinnerLazy />;
  if (!room) navigate(-1);

  return (
    <div className="min-h-full bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800">Detalle de Tarea</h1>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />}

        <div className="text-center space-y-2">
            <span className="text-sm text-gray-400 uppercase tracking-widest font-semibold">Habitación</span>
            <div className="text-6xl font-black text-gray-800 tracking-tighter">{room?.number}</div>
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold border ${getStatusStyles(room?.status)}`}>
                {room?.status.replace("STATUS_", "")}
            </div>
        </div>
        <hr className="border-gray-100" />

        <div className="grid grid-cols-1 gap-4 mt-auto">
            {room?.status !== 'STATUS_CLEAN' && (
                <button onClick={handleMarkClean} className="w-full py-5 bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-lg flex flex-col items-center justify-center gap-1">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span className="text-lg font-bold">Marcar como LIMPIA</span>
                </button>
            )}
            <button onClick={() => setIsReportOpen(true)} className="w-full py-4 bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 rounded-2xl flex items-center justify-center gap-2 font-bold">
                Reportar Incidencia
            </button>
        </div>
      </div>

      {/* MODAL */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-slide-up-mobile">
            <div className="px-4 py-4 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">Nueva Incidencia</h2>
                <button onClick={() => setIsReportOpen(false)} className="text-gray-500 p-2">Cancelar</button>
            </div>

            <form onSubmit={handleSubmitReport} className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Título Corto</label>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-blue-500" placeholder="Ej: Lámpara rota" value={reportForm.title} onChange={e => setReportForm({...reportForm, title: e.target.value})} required />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Descripción Detallada</label>
                    <textarea rows="4" className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-blue-500" placeholder="Describe el daño..." value={reportForm.description} onChange={e => setReportForm({...reportForm, description: e.target.value})} required></textarea>
                </div>

                {/* --- SECCION DE FOTOS MEJORADA --- */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Evidencias ({reportImages.length}/3)
                    </label>
                    
                    {/* MEJORA: Flex wrap para que se acomoden al lado */}
                    <div className="flex flex-wrap gap-4">
                        
                        {/* MEJORA: Ocultar botón si ya hay 3 fotos */}
                        {reportImages.length < 3 && (
                            <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                <span className="text-xs text-gray-500 mt-1 font-medium">Cámara</span>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    capture="environment" 
                                    onChange={handleAddImage}
                                />
                            </label>
                        )}

                        {/* MEJORA: Lista de previews con botón borrar */}
                        {imagePreviews.map((src, index) => (
                            <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm animate-fade-in">
                                <img src={src} alt={`Evidencia ${index + 1}`} className="w-full h-full object-cover" />
                                {/* Botón X roja */}
                                <button 
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-0 right-0 bg-red-600 text-white w-6 h-6 flex items-center justify-center rounded-bl-lg shadow-md active:scale-90 transition z-10"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-auto pt-4">
                    <button type="submit" disabled={sendingReport} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 disabled:opacity-50">
                        {sendingReport ? <span className="animate-pulse">Enviando...</span> : <span>Enviar Reporte</span>}
                    </button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
};

export default RoomDetail;