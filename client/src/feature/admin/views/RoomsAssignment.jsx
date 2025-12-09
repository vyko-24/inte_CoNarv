import React, { useEffect, useState, useRef } from "react";
import { getAllRooms, updateRoom, createRoom, changeRoomStatus, deleteRoom } from "../../../services/rooms/roomService";
import { getAllUsers } from "../../../services/user/userService";
import SpinnerLazy from "../../../utilities/SpinnerLazy";
import Alert from "../../../components/Alert";
import { QRCodeCanvas } from "qrcode.react"; // <--- IMPORTANTE

const RoomsAssignment = () => {
    // Datos y UI
    const [rooms, setRooms] = useState([]);
    const [maids, setMaids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Estados de carga individual
    const [processingId, setProcessingId] = useState(null);

    // Estados para el Modal CRUD
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentRoom, setCurrentRoom] = useState(null);

    // ESTADO PARA EL MODAL QR
    const [qrRoom, setQrRoom] = useState(null); // Habitación seleccionada para ver QR
    
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

    // --- MANEJO DE MODAL CRUD ---
    const openCreateModal = () => {
        setCurrentRoom(null);
        setFormData({ number: "", status: "STATUS_CLEAN", maidId: "" });
        setIsModalOpen(true);
        setError(null);
    };

    const openEditModal = (room) => {
        setCurrentRoom(room);
        setFormData({ 
            number: room.number, 
            status: room.status, 
            maidId: room.maid?.id || "" 
        });
        setIsModalOpen(true);
        setError(null);
    };

    // --- DESCARGAR QR ---
    const downloadQR = () => {
        const canvas = document.getElementById("qr-gen");
        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        let downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `QR_Habitacion_${qrRoom.number}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    // --- GUARDAR ---
    const handleSaveRoom = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const selectedMaid = formData.maidId 
                ? maids.find(m => m.id === Number(formData.maidId)) 
                : null;

            const roomModel = {
                id: currentRoom ? currentRoom.id : null,
                number: formData.number,
                status: formData.status,
                maid: selectedMaid 
            };

            let result;
            if (currentRoom) {
                result = await updateRoom(currentRoom.id, roomModel);
                setRooms(prev => prev.map(r => r.id === result.id ? result : r));
            } else {
                result = await createRoom(roomModel);
                setRooms(prev => [...prev, result]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            setError("Error al guardar la habitación.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAssignMaid = async (roomModel, newMaidId) => {
        try {
            setProcessingId(roomModel.id);
            const selectedMaid = maids.find(m => m.id === Number(newMaidId));
            const updatedRoomModel = { ...roomModel, maid: selectedMaid || null };
            await updateRoom(roomModel.id, updatedRoomModel);
            setRooms(prev => prev.map(r => r.id === roomModel.id ? updatedRoomModel : r));
        } catch (err) { setError("Error al asignar."); } 
        finally { setProcessingId(null); }
    };

    const handleChangeStatus = async (room, newStatus) => {
        try {
            setProcessingId(room.id);
            setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: newStatus } : r));
            await changeRoomStatus(room.id, newStatus);
        } catch (err) { setError("Error al cambiar estado."); loadData(); } 
        finally { setProcessingId(null); }
    };

    const handleDelete = async (id) => {
        try {
            setProcessingId(id);
            await deleteRoom(id);
            setRooms(prev => prev.filter(r => r.id !== id));
        } catch(err) { setError("No se pudo eliminar."); setProcessingId(null); }
    };

    const getStatusColor = (status) => {
        const s = status ? status.toUpperCase() : "";
        if (s.includes("CLEAN")) return "border-l-4 border-l-green-500";
        if (s.includes("DIRTY") || s.includes("OCCUPIED")) return "border-l-4 border-l-yellow-500";
        if (s.includes("BLOCKED")) return "border-l-4 border-l-red-500";
        return "border-l-4 border-l-gray-300";
    };

    const filteredRooms = rooms.filter((room) => {
        const term = searchTerm.toLowerCase();
        const roomNumber = room.number ? String(room.number).toLowerCase() : "";
        return roomNumber.includes(term);
    });

    if (loading) return <SpinnerLazy />;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestión de Habitaciones</h1>
                    <p className="text-gray-500 text-sm">Crea, edita y genera QRs</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <input 
                        type="text" 
                        className="block w-full md:w-64 p-2.5 text-sm border border-gray-300 rounded-lg" 
                        placeholder="Buscar..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                        <span>+ Nueva</span>
                    </button>
                </div>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredRooms.map((room) => (
                    <div key={room.id} className={`bg-white rounded-xl shadow-sm p-4 hover:shadow-md flex flex-col gap-3 relative ${getStatusColor(room.status)}`}>
                        
                        {/* Fila 1 */}
                        <div className="flex justify-between items-start">
                            <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{room.number}</h3>
                            <div className="flex gap-1">
                                {/* Botón QR */}
                                <button onClick={() => setQrRoom(room)} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition" title="Ver QR">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                                </button>
                                {/* Botón Editar */}
                                <button onClick={() => openEditModal(room)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition" title="Editar">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                </button>
                                {/* Botón Borrar */}
                                <button onClick={() => handleDelete(room.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition" title="Eliminar">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>

                        {/* Status y Camarera (Simplificado) */}
                        <div className="space-y-2">
                             <select 
                                className="block w-full py-1.5 px-2 text-xs font-bold rounded border-gray-200 bg-gray-50"
                                value={room.status}
                                onChange={(e) => handleChangeStatus(room, e.target.value)}
                            >
                                <option value="STATUS_CLEAN">LIMPIA</option>
                                <option value="STATUS_DIRTY">SUCIA</option>
                                <option value="STATUS_BLOCKED">MANTENIMIENTO</option>
                            </select>

                            <select
                                className="block w-full py-1.5 px-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg"
                                value={room.maid?.id || ""}
                                onChange={(e) => handleAssignMaid(room, e.target.value)}
                            >
                                <option value="">-- Sin asignar --</option>
                                {maids.map((maid) => (
                                    <option key={maid.id} value={maid.id}>{maid.username}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL QR (Nuevo) */}
            {qrRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 flex flex-col items-center">
                        <h3 className="font-bold text-xl text-gray-800 mb-2">Habitación {qrRoom.number}</h3>
                        <p className="text-sm text-gray-500 mb-6 text-center">Escanea este código para acceder a las opciones de limpieza.</p>
                        
                        <div className="p-4 bg-white border-2 border-gray-100 rounded-xl shadow-inner mb-6">
                            <QRCodeCanvas 
                                id="qr-gen"
                                value={String(qrRoom.id)} // Valor = ID de la habitación
                                size={200}
                                level={"H"} // Alta corrección de errores
                                includeMargin={true}
                            />
                        </div>

                        <div className="flex gap-3 w-full">
                            <button onClick={() => setQrRoom(null)} className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 rounded-xl hover:bg-gray-200">
                                Cerrar
                            </button>
                            <button onClick={downloadQR} className="flex-1 py-3 text-white font-bold bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 flex justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                Descargar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CREAR/EDITAR (Simplificado para el ejemplo) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-50 backdrop-blur-sm bg-black">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="font-bold text-lg mb-4">{currentRoom ? "Editar" : "Nueva"} Habitación</h3>
                        <form onSubmit={handleSaveRoom} className="space-y-4">
                            <input type="text" placeholder="Número" value={formData.number} onChange={(e) => setFormData({...formData, number: e.target.value})} className="w-full border p-2 rounded-lg" required />
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 p-2 rounded-lg">Cancelar</button>
                                <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded-lg">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomsAssignment;