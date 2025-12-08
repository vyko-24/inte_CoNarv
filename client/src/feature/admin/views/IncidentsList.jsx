import React, { useEffect, useState } from "react";
import { getAllReports } from "../../../services/report/reportService";
import SpinnerLazy from "../../../utilities/SpinnerLazy";
import Alert from "../../../components/Alert";

const IncidentsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Estado para el Modal de detalle
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getAllReports();
      console.log(data);
      
      setReports(data);
    } catch (err) {
      setError("No se pudieron cargar las incidencias.");
    } finally {
      setLoading(false);
    }
  };

  // Lógica de Filtrado
  const filteredReports = reports.filter((report) => {
    // 1. Filtro de texto (Título, Descripción o Número de Habitación)
    const term = searchTerm.toLowerCase();
    const titleMatch = report.title?.toLowerCase().includes(term);
    const descMatch = report.description?.toLowerCase().includes(term);
    const roomMatch = report.room?.number ? String(report.room.number).toLowerCase().includes(term) : false;
    
    const matchesSearch = titleMatch || descMatch || roomMatch;

    // 2. Filtro de Estado (Select)
    const matchesStatus = statusFilter === "" || report.room?.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Helper para estilos de badges (reutilizable)
  const getStatusBadgeStyles = (status) => {
    const s = status ? status.toUpperCase() : "";
    if (s.includes("BLOCKED") || s.includes("MAINTENANCE")) return "bg-red-100 text-red-700 border-red-200";
    if (s.includes("DIRTY") || s.includes("OCCUPIED")) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (s.includes("CLEAN")) return "bg-green-100 text-green-700 border-green-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading) return <SpinnerLazy />;

  return (
    <div className="space-y-6 pb-20"> {/* pb-20 para dar espacio en móviles si hay nav inferior */}
      
      {/* Header y Controles */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Centro de Incidencias</h1>
                <p className="text-gray-500 text-sm">Gestiona los reportes y daños</p>
            </div>
            <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold self-start md:self-auto">
                {filteredReports.length} {filteredReports.length === 1 ? 'Reporte' : 'Reportes'}
            </div>
        </div>

        {/* Barra de Herramientas (Search & Filter) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
            {/* Buscador */}
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                </div>
                <input 
                    type="text" 
                    className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Buscar por título, hab..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Filtro Dropdown */}
            <div className="w-full md:w-48">
                <select 
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Todos los estados</option>
                    <option value="STATUS_BLOCKED">Bloqueadas (Mnt.)</option>
                    <option value="STATUS_OCCUPIED">Sucias / Ocupadas</option>
                    <option value="STATUS_CLEAN">Limpias</option>
                </select>
            </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Grid de Reportes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300 flex flex-col h-full">
            
            {/* Cabecera Card */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="bg-white w-8 h-8 flex items-center justify-center rounded-full shadow-sm text-lg border border-gray-100">🚪</span>
                    <span className="font-bold text-gray-700 text-lg">
                        {report.room ? report.room.number : "N/A"}
                    </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${getStatusBadgeStyles(report.room?.status)}`}>
                    {report.room?.status?.replace("STATUS_", "") || 'UNKNOWN'}
                </span>
            </div>

            {/* Cuerpo Card */}
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-1" title={report.title}>
                    {report.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">
                    {report.description}
                </p>
                
                {/* Indicador de fotos mini */}
                {report.images && report.images.length > 0 && (
                     <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span>{report.images.length} fotos adjuntas</span>
                     </div>
                )}
            </div>

            {/* Footer con Botón Grande (Touch Friendly) */}
            <div className="p-4 pt-0 mt-auto">
                <button 
                    onClick={() => setSelectedReport(report)}
                    className="w-full py-3 px-4 bg-white border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 font-semibold text-sm transition active:scale-[0.98] shadow-sm"
                >
                    Ver Detalles
                </button>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <p className="text-sm font-medium">No se encontraron reportes con estos filtros.</p>
                <button 
                    onClick={() => {setSearchTerm(""); setStatusFilter("");}}
                    className="mt-2 text-blue-600 text-sm hover:underline"
                >
                    Limpiar búsqueda
                </button>
            </div>
        )}
      </div>

      {/* MODAL DE DETALLES - Optimizado para Móvil */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-opacity-60 backdrop-blur-sm p-0 md:p-4">
            
            {/* Contenedor Modal: Full width bottom sheet en mobile, Centered card en desktop */}
            <div className="bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] animate-slide-up-mobile md:animate-fade-in">
                
                {/* Header Modal */}
                <div className="bg-white px-6 py-4 border-b flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Detalle de Incidencia</h2>
                        <span className="text-xs text-gray-500">ID: #{selectedReport.id}</span>
                    </div>
                    <button 
                        onClick={() => setSelectedReport(null)}
                        className="bg-gray-100 p-2 rounded-full text-gray-500 hover:bg-gray-200 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Contenido Scrollable */}
                <div className="p-6 overflow-y-auto">
                    {/* Info Habitación */}
                    <div className="flex items-center gap-3 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                         <div className="bg-white p-2 rounded-md shadow-sm text-xl">
                            🏨
                         </div>
                         <div>
                            <p className="text-xs text-blue-600 font-bold uppercase">Habitación Afectada</p>
                            <p className="text-lg font-bold text-gray-800">{selectedReport.room?.number}</p>
                         </div>
                         <div className="ml-auto">
                             <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusBadgeStyles(selectedReport.room?.status)}`}>
                                {selectedReport.room?.status?.replace("STATUS_", "")}
                             </span>
                         </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedReport.title}</h3>
                        <div className="bg-gray-50 p-4 rounded-lg text-gray-700 border border-gray-100 text-sm leading-relaxed whitespace-pre-line">
                            {selectedReport.description}
                        </div>
                    </div>

                    <div>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-3">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            Evidencia Fotográfica
                        </h4>
                        {selectedReport.images && selectedReport.images.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {selectedReport.images.map((img, idx) => (
                                    <div key={idx} className="relative group">
                                        <img 
                                            src={img.url} 
                                            alt={`Evidencia ${idx}`}
                                            className="w-full h-40 object-cover rounded-lg border border-gray-200 shadow-sm"
                                        />
                                        {/* Botón ver imagen full (opcional) */}
                                        <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-sm text-gray-400 italic">No se adjuntaron fotografías.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Modal Sticky */}
                <div className="p-4 border-t bg-gray-50 mt-auto flex justify-end">
                    <button 
                        onClick={() => setSelectedReport(null)}
                        className="w-full md:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-sm font-bold transition shadow-sm"
                    >
                        Cerrar Detalle
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default IncidentsList;