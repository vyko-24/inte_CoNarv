import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { getAllRooms } from "../../../services/rooms/roomService";
import AuthContext from "../../../context/authcontext";
import SpinnerLazy from "../../../utilities/SpinnerLazy";

const MaidHome = () => {
  const { user } = useContext(AuthContext); // Necesitamos saber quién está logueado
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("mine"); // "mine" | "all"

  useEffect(() => {
    // Aquí idealmente cargarías desde LocalStorage primero si es offline
    // Por ahora, cargamos de red
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await getAllRooms();
      setRooms(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Lógica de Filtrado
  const displayedRooms = rooms.filter(room => {
    if (activeTab === "all") return true;
    // "mine": Solo si el ID de la maid coincide con el usuario logueado
    return room.maid?.id === user?.id;
  });

  // Helpers de Estilos
  const getStatusStyles = (status) => {
    const s = status ? status.toUpperCase() : "";
    if (s.includes("CLEAN")) return { border: "border-green-500", bg: "bg-green-50", text: "text-green-700", label: "LIMPIA" };
    if (s.includes("DIRTY")) return { border: "border-yellow-500", bg: "bg-yellow-50", text: "text-yellow-700", label: "SUCIA" };
    if (s.includes("BLOCKED")) return { border: "border-red-500", bg: "bg-red-50", text: "text-red-700", label: "BLOQUEADA" };
    return { border: "border-gray-300", bg: "bg-white", text: "text-gray-500", label: "DESC." };
  };

  if (loading) return <SpinnerLazy />;

  return (
    <div className="p-4">
      {/* TABS */}
      <div className="flex bg-gray-200 p-1 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab("mine")}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
            activeTab === "mine" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
          }`}
        >
          Mis Habitaciones
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
            activeTab === "all" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
          }`}
        >
          Todas
        </button>
      </div>

      {/* LISTA DE TARJETAS */}
      <div className="space-y-4">
        {displayedRooms.length > 0 ? (
          displayedRooms.map((room) => {
            const styles = getStatusStyles(room.status);
            return (
              <Link 
                to={`/room/${room.id}`} 
                key={room.id}
                className={`block bg-white rounded-xl shadow-sm border-l-8 p-5 active:scale-[0.98] transition-transform ${styles.border}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-extrabold text-gray-800">{room.number}</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        {room.maid ? `Asignada a: ${room.maid.username}` : "Sin asignar"}
                    </p>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${styles.bg} ${styles.text}`}>
                    {styles.label}
                  </div>
                </div>

                {/* Indicador visual extra si está bloqueada */}
                {styles.label === "BLOQUEADA" && (
                    <div className="mt-3 text-xs text-red-600 font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        Ver incidencia
                    </div>
                )}
              </Link>
            );
          })
        ) : (
          <div className="text-center py-20 opacity-50">
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            <p className="text-gray-500 font-medium">¡Todo listo! No tienes tareas pendientes aquí.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaidHome;