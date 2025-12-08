import React, { useEffect, useState } from "react";
import { getAllRooms, updateCleanTime } from "../../../services/rooms/roomService";
import { getAllReports } from "../../../services/report/reportService";
import SpinnerLazy from "../../../utilities/SpinnerLazy";
import Alert from "../../../components/Alert";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, clean: 0, dirty: 0, blocked: 0 });
  const [recentReports, setRecentReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [lastRoutineTime, setLastRoutineTime] = useState(null);

  // Estados para el Modal de Configuración de Rutina
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [routineTime, setRoutineTime] = useState("");

  const formatTime = (isoString) => {
    if (!isoString) return "Sin definir";
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    });
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [roomsData, reportsData] = await Promise.all([
        getAllRooms(),
        getAllReports()
      ]);

      const metrics = {
        total: roomsData.length,
        clean: roomsData.filter(r => r.status === "STATUS_CLEAN").length,
        dirty: roomsData.filter(r => r.status === "STATUS_OCCUPIED" || r.status === "STATUS_DIRTY").length,
        blocked: roomsData.filter(r => r.status === "STATUS_BLOCKED" || r.status === "STATUS_MAINTENANCE").length,
      };
      setStats(metrics);
      
      const sortedReports = reportsData.sort((a, b) => b.id - a.id).slice(0, 5);
      setRecentReports(sortedReports);
      

      if (roomsData.length > 0 && roomsData[0].cleanTime) {
        console.log(roomsData);
        setLastRoutineTime(roomsData[0].cleanTime);
      } else {
        setLastRoutineTime(null);
      }

    } catch (err) {
      setError("No se pudo cargar la información del panel.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Establecer hora actual por defecto en el input
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setRoutineTime(`${hours}:${minutes}`);
  }, []);

  // Abre el modal
  const openRoutineModal = () => {
    setIsRoutineModalOpen(true);
    setError(null);
  };

  // Ejecuta la acción final
  const handleConfirmRoutine = async () => {
    try {
        setIsLoading(true);
        setIsRoutineModalOpen(false); // Cerrar modal

        // Llamamos al servicio con la hora configurada
        await updateCleanTime(routineTime); 
        
        setSuccessMsg("¡Rutina iniciada! Habitaciones reseteadas a LIMPIAS.");
        await fetchDashboardData(); // Recargar datos para ver los cambios
        
        setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
        setError("Error al iniciar la rutina diaria.");
        setIsLoading(false);
    }
  };

  if (isLoading) return <SpinnerLazy />;

  return (
    <div className="space-y-6 pb-10">
      
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Panel General</h1>
          <p className="text-gray-500">Resumen operativo del hotel</p>
          {/* 4. VISUALIZACIÓN DE LA HORA */}
          <span className="hidden md:inline text-gray-300">|</span>
          <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Rutina: {formatTime(lastRoutineTime)}</span>
          </div>
        </div>
        <button 
          onClick={openRoutineModal}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition transform active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>Configurar Rutina Diaria</span>
        </button>
      </div>

      {/* Grid de Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Habitaciones" value={stats.total} icon="🏨" color="bg-blue-500" />
        <StatsCard title="Sucias / Ocupadas" value={stats.dirty} icon="🧹" color="bg-yellow-500" />
        <StatsCard title="Listas / Limpias" value={stats.clean} icon="✨" color="bg-green-500" />
        <StatsCard title="Incidencias Activas" value={stats.blocked} icon="⚠️" color="bg-red-500" />
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Últimas Incidencias</h3>
        </div>
        <div className="divide-y divide-gray-50">
            {recentReports.length > 0 ? (
                recentReports.map((report) => (
                    <div key={report.id} className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                            {report.room?.number}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{report.title}</p>
                            <p className="text-sm text-gray-500">{report.description}</p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="p-8 text-center text-gray-400">No hay reportes recientes.</div>
            )}
        </div>
      </div>

      {/* --- MODAL DE CONFIGURACIÓN DE RUTINA --- */}
      {isRoutineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4  bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                
                <div className="bg-blue-600 px-6 py-4 border-b border-blue-500 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">Iniciar Rutina Diaria</h3>
                    <button onClick={() => setIsRoutineModalOpen(false)} className="text-blue-200 hover:text-white">✕</button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Esta acción <b>cambiara la hora de limpieza</b> de todas las habitaciones.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hora de Inicio de Rutina
                        </label>
                        <input 
                            type="time" 
                            value={routineTime}
                            onChange={(e) => setRoutineTime(e.target.value)}
                            className="block w-full px-4 py-3 text-lg border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                        <p className="text-xs text-gray-400 mt-2">
                            Se registrará esta hora como el inicio del turno de limpieza.
                        </p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            onClick={() => setIsRoutineModalOpen(false)}
                            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirmRoutine}
                            className="flex-1 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition shadow-md hover:shadow-lg flex justify-center items-center gap-2"
                        >
                            Confirmar Inicio
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const StatsCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
    <div>
      <p className="text-sm text-gray-500 font-semibold mb-1 uppercase tracking-wide">{title}</p>
      <h4 className="text-3xl font-extrabold text-gray-800">{value}</h4>
    </div>
    <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg`}>
      {icon}
    </div>
  </div>
);

export default AdminDashboard;