import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoomById, changeRoomStatus } from "../../../services/rooms/roomService";
import { createReport } from "../../../services/report/reportService";
import SpinnerLazy from "../../../utilities/SpinnerLazy";
import Alert from "../../../components/Alert";
import { AlertHelper } from "../../../utilities/AlertHelper";
// IMPORTANTE: Instala esta librería: npm install browser-image-compression
import imageCompression from 'browser-image-compression';

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ title: "", description: "" });
  const [reportImages, setReportImages] = useState([]); 
  const [imagePreviews, setImagePreviews] = useState([]);
  const [sendingReport, setSendingReport] = useState(false);

  // --- 1. SINCRONIZACIÓN AUTOMÁTICA (Magia Offline) ---
  useEffect(() => {
    const syncOfflineReports = async () => {
      if (navigator.onLine) {
        const offlineData = localStorage.getItem("offline_reports");
        if (offlineData) {
            const pendingReports = JSON.parse(offlineData);
            if (pendingReports.length > 0) {
                AlertHelper.showAlert(`Sincronizando ${pendingReports.length} reportes offline...`, "info");
                
                for (const report of pendingReports) {
                    try {
                        // Reconstruir archivos desde Base64
                        const files = await Promise.all(report.imagesBase64.map(base64 => urltoFile(base64, 'evidencia.jpg', 'image/jpeg')));
                        
                        await createReport({
                            title: report.title,
                            description: report.description,
                            roomId: report.roomId,
                            imagesFiles: files
                        });
                    } catch (e) {
                        console.error("Error syncing", e);
                    }
                }
                localStorage.removeItem("offline_reports");
                AlertHelper.showAlert("Sincronización completada", "success");
            }
        }
      }
    };
    
    syncOfflineReports();
    fetchRoom();
  }, [id]);

  // Helper para convertir Base64 guardado a File real
  const urltoFile = (url, filename, mimeType) => {
    return (fetch(url)
        .then(function(res){return res.arrayBuffer();})
        .then(function(buf){return new File([buf], filename,{type:mimeType});})
    );
  }

  // Helper para convertir File a Base64 (para guardar offline)
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  const fetchRoom = async () => {
    try {
      setLoading(true);
      const data = await getRoomById(id);
      setRoom(data);
    } catch (err) { setError("No se pudo cargar la habitación."); } finally { setLoading(false); }
  };

  const handleMarkClean = async () => {
    if (!window.confirm("¿Confirmas que la habitación está lista?")) return;
    try {
        setLoading(true);
        await changeRoomStatus(room.id, "STATUS_CLEAN");
        setSuccessMsg("¡Habitación marcada como LIMPIA!");
        setTimeout(() => navigate("/"), 1500);
    } catch (err) { setError("Error al actualizar estado."); setLoading(false); }
  };

  // --- 2. LÓGICA DE FOTOS CON COMPRESIÓN ---
  const handleAddImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (reportImages.length >= 3) { AlertHelper.showAlert("Máximo 3 fotos", "warning"); return; }

    try {
        // Opciones de compresión: max 1MB, max 1920px ancho
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
        const compressedFile = await imageCompression(file, options);

        setReportImages([...reportImages, compressedFile]); // Guardamos el comprimido

        const reader = new FileReader();
        reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result]);
        reader.readAsDataURL(compressedFile);
        e.target.value = null; 
    } catch (error) {
        console.log("Error comprimiendo", error);
        AlertHelper.showAlert("Error procesando imagen", "error");
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setReportImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- 3. ENVÍO INTELIGENTE ---
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setSendingReport(true);

    try {
        const reportModel = {
            title: reportForm.title || "Incidencia General",
            description: reportForm.description,
            roomId: room.id,
            imagesFiles: reportImages 
        };

        if (!navigator.onLine) {
            // AQUI ESTABA EL ERROR: Convertimos fotos a texto Base64 antes de guardar
            const imagesBase64 = await Promise.all(reportImages.map(file => fileToBase64(file)));
            
            const pendingReports = JSON.parse(localStorage.getItem("offline_reports") || "[]");
            pendingReports.push({ 
                ...reportModel, 
                imagesFiles: null, // No guardamos el File
                imagesBase64: imagesBase64, // Guardamos el texto
                offline: true 
            });
            localStorage.setItem("offline_reports", JSON.stringify(pendingReports));
            
            AlertHelper.showAlert("Sin conexión. Guardado para envío automático.", "info");
            setIsReportOpen(false);
            navigate("/");
            return;
        }

        await createReport(reportModel);
        AlertHelper.showAlert("Reporte enviado con éxito", "success");
        setIsReportOpen(false);
        setReportImages([]); setImagePreviews([]); setReportForm({ title: "", description: "" });
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
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
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
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
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
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50" placeholder="Ej: Lámpara rota" value={reportForm.title} onChange={e => setReportForm({...reportForm, title: e.target.value})} required />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Descripción Detallada</label>
                    <textarea rows="4" className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50" placeholder="Describe el daño..." value={reportForm.description} onChange={e => setReportForm({...reportForm, description: e.target.value})} required></textarea>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Evidencias ({reportImages.length}/3)</label>
                    <div className="flex flex-wrap gap-4">
                        {reportImages.length < 3 && (
                            <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                <span className="text-xs text-gray-500 mt-1 font-medium">Cámara</span>
                                <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleAddImage} />
                            </label>
                        )}
                        {imagePreviews.map((src, index) => (
                            <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                                <img src={src} alt="Evidencia" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-0 right-0 bg-red-600 text-white w-6 h-6 flex items-center justify-center rounded-bl-lg">✕</button>
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