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
  
  // Estados de Datos
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Estados del Modal de Incidencia
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ title: "", description: "" });
  const [reportImage, setReportImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sendingReport, setSendingReport] = useState(false);

  // --- CARGA DE DATOS ---
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

  // --- ACCIÓN: MARCAR COMO LIMPIA ---
  const handleMarkClean = async () => {
    if (!window.confirm("¿Confirmas que la habitación está lista?")) return;
    
    try {
        setLoading(true);
        
        // Verificamos conexión (simulada)
        if (!navigator.onLine) {
            AlertHelper.showAlert("Estas sin conexion, revisa tu red","info")
            // Aquí iría la lógica de Queue en LocalStorage
            navigate(-1);
            return;
        }

        await changeRoomStatus(room.id, "STATUS_CLEAN");
        
        setSuccessMsg("¡Habitación marcada como LIMPIA!");
        // Pequeño delay para que vea el mensaje y regresar
        setTimeout(() => navigate("/"), 1500);
        
    } catch (err) {
        setError("Error al actualizar estado.");
        setLoading(false);
    }
  };

  // --- ACCIÓN: REPORTAR INCIDENCIA ---
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setReportImage(file);
        // Crear preview local
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setSendingReport(true);

    try {
        // Objeto para el Adapter
        const reportModel = {
            title: reportForm.title || "Incidencia General",
            description: reportForm.description,
            roomId: room.id,
            imagesFiles: reportImage ? [reportImage] : [] // Array de archivos
        };

        if (!navigator.onLine) {
            // Lógica Offline: Guardar en LocalStorage
            const pendingReports = JSON.parse(localStorage.getItem("offline_reports") || "[]");
            // Nota: No podemos guardar el archivo binario 'file' en localStorage fácilmente.
            // En una PWA real se usa IndexedDB. Aquí guardaremos solo texto como demo.
            pendingReports.push({ ...reportModel, imagesFiles: null, offline: true });
            localStorage.setItem("offline_reports", JSON.stringify(pendingReports));
            
            AlertHelper.showAlert("Sin conexión. Reporte guardado localmente.","info")
            setIsReportOpen(false);
            navigate("/");
            return;
        }

        await createReport(reportModel);
        
        // Bloquear habitación automáticamente tras reporte (opcional, según regla de negocio)
        // await changeRoomStatus(room.id, "STATUS_BLOCKED");

        AlertHelper.showAlert("Reporte enviado con exitos","success")

        setIsReportOpen(false);
        fetchRoom(); // Recargar estado
    } catch (err) {
        console.error(err);
        AlertHelper.showAlert("Error al enviar reporte","error")
    } finally {
        setSendingReport(false);
    }
  };

  // --- HELPER VISUAL ---
  const getStatusStyles = (status) => {
    const s = status ? status.toUpperCase() : "";
    if (s.includes("CLEAN")) return "text-green-600 bg-green-100 border-green-200";
    if (s.includes("DIRTY") || s.includes("OCCUPIED")) return "text-yellow-600 bg-yellow-100 border-yellow-200";
    if (s.includes("BLOCKED")) return "text-red-600 bg-red-100 border-red-200";
    return "text-gray-600 bg-gray-100";
  };

  if (loading) return <SpinnerLazy />;
  if (!room) {
    navigate(-1);
  }

  return (
    <div className="min-h-full bg-white flex flex-col">
      
      {/* 1. Header de Navegación */}
      <div className="px-4 py-4 flex items-center gap-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95 transition"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800">Detalle de Tarea</h1>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
        
        {/* Alertas */}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />}

        {/* 2. Información Principal (Grande) */}
        <div className="text-center space-y-2">
            <span className="text-sm text-gray-400 uppercase tracking-widest font-semibold">Habitación</span>
            <div className="text-6xl font-black text-gray-800 tracking-tighter">
                {room.number}
            </div>
            
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold border ${getStatusStyles(room.status)}`}>
                {room.status.replace("STATUS_", "")}
            </div>
        </div>

        {/* Separador */}
        <hr className="border-gray-100" />

        {/* 3. Acciones Principales */}
        <div className="grid grid-cols-1 gap-4 mt-auto">
            
            {/* Botón LIMPIAR (Solo si no está limpia) */}
            {room.status !== 'STATUS_CLEAN' && (
                <button
                    onClick={handleMarkClean}
                    className="w-full py-5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-2xl shadow-lg shadow-green-200 flex flex-col items-center justify-center gap-1 transition-transform active:scale-[0.98]"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span className="text-lg font-bold">Marcar como LIMPIA</span>
                </button>
            )}

            {/* Botón REPORTAR (Siempre visible) */}
            <button
                onClick={() => setIsReportOpen(true)}
                className="w-full py-4 bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 active:bg-red-100 rounded-2xl flex items-center justify-center gap-2 font-bold transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Reportar Incidencia
            </button>
        </div>
      </div>

      {/* 4. MODAL DE INCIDENCIA (Full Screen en Móvil) */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-slide-up-mobile">
            {/* Header Modal */}
            <div className="px-4 py-4 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">Nueva Incidencia</h2>
                <button 
                    onClick={() => setIsReportOpen(false)}
                    className="text-gray-500 p-2"
                >
                    Cancelar
                </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmitReport} className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Título Corto</label>
                    <input 
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Lámpara rota"
                        value={reportForm.title}
                        onChange={e => setReportForm({...reportForm, title: e.target.value})}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Descripción Detallada</label>
                    <textarea 
                        rows="4"
                        className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe el daño encontrado..."
                        value={reportForm.description}
                        onChange={e => setReportForm({...reportForm, description: e.target.value})}
                        required
                    ></textarea>
                </div>

                {/* Input Cámara */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Evidencia (Foto)</label>
                    
                    <div className="flex items-center gap-4">
                        {/* Botón Fake para estilizar el input file */}
                        <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span className="text-xs text-gray-500 mt-1">Cámara</span>
                            
                            {/* Input Oculto con capture environment */}
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                capture="environment" 
                                onChange={handleImageChange}
                            />
                        </label>

                        {/* Preview */}
                        {imagePreview && (
                            <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <button 
                                    type="button"
                                    onClick={() => { setReportImage(null); setImagePreview(null); }}
                                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-auto pt-4">
                    <button
                        type="submit"
                        disabled={sendingReport}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                        {sendingReport ? (
                            <span className="animate-pulse">Enviando...</span>
                        ) : (
                            <>
                                <span>Enviar Reporte</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
};

export default RoomDetail;