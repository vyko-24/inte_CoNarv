import React, { useEffect, useState } from "react";
import { getAllRooms, updateRoom, createRoom, changeRoomStatus, deleteRoom } from "../../../services/rooms/roomService";
import { getAllUsers } from "../../../services/user/userService";
import SpinnerLazy from "../../../utilities/SpinnerLazy";
import Alert from "../../../components/Alert";

const RoomsAssignment = () => {
    // Datos y UI
    const [rooms, setRooms] = useState([]);
    const [maids, setMaids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Estados de carga individual
    const [processingId, setProcessingId] = useState(null);

    // Estados para el Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentRoom, setCurrentRoom] = useState(null);
    
    // FORM DATA AHORA INCLUYE STATUS Y MAID
    const [formData, setFormData] = useState({ 
        number: "", 
        status: "STATUS_CLEAN", 
        maidId: "" 
    });

    // --- CARGA INICIAL ---
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [roomsData, usersData] = await Promise.all([
                getAllRooms(),
                getAllUsers()
            ]);
            console.log("Rooms data:", roomsData);
            setRooms(roomsData);
            const maidList = (usersData.result || usersData).filter(
                user => user?.role === "ROLE_MAID"
            );
            setMaids(maidList);
        } catch (err) {
            console.error(err);
            setError("Error cargando la información.");
        } finally {
            setLoading(false);
        }
    };

    // --- MANEJO DE MODAL ---
    const openCreateModal = () => {
        setCurrentRoom(null);
        // Resetear formulario con valores por defecto
        setFormData({ 
            number: "", 
            status: "STATUS_CLEAN", 
            maidId: "" 
        });
        setIsModalOpen(true);
        setError(null);
    };

    const openEditModal = (room) => {
        setCurrentRoom(room);
        // Llenar formulario con datos existentes
        setFormData({ 
            number: room.number, 
            status: room.status, 
            maidId: room.maid?.id || "" 
        });
        setIsModalOpen(true);
        setError(null);
    };

    // --- GUARDAR (Crear o Editar Completo) ---
    const handleSaveRoom = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // 1. Buscar el objeto camarera completo basado en el ID seleccionado
            const selectedMaid = formData.maidId 
                ? maids.find(m => m.id === Number(formData.maidId)) 
                : null;

            // 2. Construir el objeto base
            const roomModel = {
                id: currentRoom ? currentRoom.id : null,
                number: formData.number,
                status: formData.status,
                maid: selectedMaid // Objeto completo o null
            };

            let result;
            if (currentRoom) {
                // MODO EDICIÓN (PUT)
                result = await updateRoom(currentRoom.id, roomModel);
                setRooms(prev => prev.map(r => r.id === result.id ? result : r));
            } else {
                // MODO CREACIÓN (POST)
                result = await createRoom(roomModel);
                setRooms(prev => [...prev, result]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            setError("Error al guardar la habitación. Verifica los datos.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- ACCIONES EN TARJETA ---
    const handleAssignMaid = async (roomModel, newMaidId) => {
        try {
            console.log("Assigning maid:", newMaidId, "to room:", roomModel);
            setProcessingId(roomModel.id);
            const selectedMaid = maids.find(m => m.id === Number(newMaidId));
            const updatedRoomModel = { ...roomModel, maid: selectedMaid || null };
            await updateRoom(roomModel.id, updatedRoomModel);
            setRooms(prev => prev.map(r => r.id === roomModel.id ? updatedRoomModel : r));
        } catch (err) {
            console.error(err);
            setError("Error al asignar camarera.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleChangeStatus = async (room, newStatus) => {
        try {
            setProcessingId(room.id);
            setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: newStatus } : r));
            await changeRoomStatus(room.id, newStatus);
        } catch (err) {
            console.error(err);
            setError("Error al cambiar estado.");
            loadData();
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id) => {
        try {
            setProcessingId(id);
            await deleteRoom(id);
            setRooms(prev => prev.filter(r => r.id !== id));
        } catch(err) {
            setError("No se pudo eliminar la habitación.");
            setProcessingId(null);
        }
    };

    // --- HELPERS VISUALES ---
    const getStatusColor = (status) => {
        const s = status ? status.toUpperCase() : "";
        if (s.includes("CLEAN")) return "border-l-4 border-l-green-500";
        if (s.includes("DIRTY") || s.includes("OCCUPIED")) return "border-l-4 border-l-yellow-500";
        if (s.includes("BLOCKED") || s.includes("MAINTENANCE")) return "border-l-4 border-l-red-500";
        return "border-l-4 border-l-gray-300";
    };

    const filteredRooms = rooms.filter((room) => {
        const term = searchTerm.toLowerCase();
        const roomNumber = room.number ? String(room.number).toLowerCase() : "";
        const maidName = room.maid?.username ? room.maid.username.toLowerCase() : "";
        return roomNumber.includes(term) || maidName.includes(term);
    });

    if (loading) return <SpinnerLazy />;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestión de Habitaciones</h1>
                    <p className="text-gray-500 text-sm">Crea, edita y asigna habitaciones</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input 
                            type="text" 
                            className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500" 
                            placeholder="Buscar..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        onClick={openCreateModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        <span className="hidden sm:inline">Nueva</span>
                    </button>
                </div>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredRooms.map((room) => (
                    <div
                        key={room.id}
                        className={`bg-white rounded-xl shadow-sm p-4 transition hover:shadow-md flex flex-col gap-3 relative overflow-hidden ${getStatusColor(room.status)}`}
                    >
                        {processingId === room.id && (
                            <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
                                <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                            </div>
                        )}

                        {/* Fila 1 */}
                        <div className="flex justify-between items-start">
                            <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{room.number}</h3>
                            <div className="flex gap-1">
                                <button onClick={() => openEditModal(room)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition" title="Editar">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                </button>
                                <button onClick={() => handleDelete(room.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition" title="Eliminar">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>

                        {/* Fila 2 - Status */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estado Actual</label>
                            <select 
                                className={`mt-1 block w-full py-1.5 px-2 text-xs font-bold rounded border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 cursor-pointer
                                    ${room.status === 'STATUS_CLEAN' ? 'text-green-700 bg-green-50 ring-green-200' : 
                                      room.status === 'STATUS_DIRTY' ? 'text-yellow-700 bg-yellow-50 ring-yellow-200' : 
                                      'text-red-700 bg-red-50 ring-red-200'}`}
                                value={room.status}
                                onChange={(e) => handleChangeStatus(room, e.target.value)}
                            >
                                <option value="STATUS_CLEAN">LIMPIA (Disponible)</option>
                                <option value="STATUS_DIRTY">SUCIA (Ocupada)</option>
                                <option value="STATUS_BLOCKED">MANTENIMIENTO</option>
                            </select>
                        </div>

                        {/* Fila 3 - Camarera */}
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Camarera Asignada</label>
                            <select
                                className="mt-1 block w-full py-1.5 px-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                value={room.maid?.id || ""}
                                onChange={(e) => handleAssignMaid(room, e.target.value)}
                            >
                                <option value="">-- Sin asignar --</option>
                                {maids.map((maid) => (
                                    <option key={maid.id} value={maid.id}>
                                        {maid.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL (CREAR / EDITAR) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">
                                {currentRoom ? "Editar Habitación" : "Nueva Habitación"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        
                        <form onSubmit={handleSaveRoom} className="p-6 space-y-4">
                            {/* Input Número */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Número / Identificador
                                </label>
                                <input
                                    type="text"
                                    value={formData.number}
                                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                    required
                                    placeholder="Ej: A-101"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    autoFocus
                                />
                            </div>

                            {/* Select Estado */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estado Inicial
                                </label>
                                <select 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="STATUS_CLEAN">LIMPIA (Disponible)</option>
                                    <option value="STATUS_DIRTY">SUCIA (Ocupada)</option>
                                    <option value="STATUS_BLOCKED">MANTENIMIENTO</option>
                                </select>
                            </div>

                            {/* Select Camarera */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Camarera Encargada
                                </label>
                                <select 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    value={formData.maidId}
                                    onChange={(e) => setFormData({ ...formData, maidId: e.target.value })}
                                >
                                    <option value="">-- Sin asignar --</option>
                                    {maids.map((maid) => (
                                        <option key={maid.id} value={maid.id}>
                                            {maid.username}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition disabled:opacity-50"
                                >
                                    {isSaving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomsAssignment;