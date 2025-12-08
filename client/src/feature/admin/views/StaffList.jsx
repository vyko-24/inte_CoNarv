import React, { useEffect, useState } from "react";
import { getAllUsers, updateUser, changeUserStatus } from "../../../services/user/userService";
import SpinnerLazy from "../../../utilities/SpinnerLazy";
import Alert from "../../../components/Alert";

const StaffList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para el Modal de Edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError("Error al cargar el personal.");
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica de Filtrado ---
  const filteredUsers = users.filter((user) => {
    // 1. Excluir Administradores
    if (user.role === "ROLE_ADMIN") return false;

    // 2. Filtro de búsqueda por nombre
    const term = searchTerm.toLowerCase();
    return user.username.toLowerCase().includes(term);
  });

  // --- Manejadores de Acciones ---

  const handleStatusChange = async (user) => {
    try {
      // Optimismo en UI: Cambiamos el estado localmente antes de confirmar con el server
      // para que se sienta instantáneo en móvil.
      const newStatus = !user.status;
      
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      
      await changeUserStatus(user.id);
    } catch (err) {
      // Si falla, revertimos
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: !user.status } : u));
      setError("No se pudo cambiar el estado del usuario.");
    }
  };

  const handleEditClick = (user) => {
    setEditingUser({ ...user }); // Copia para no mutar directo
    setIsModalOpen(true);
    setError(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedUser = await updateUser(editingUser.id, editingUser);
      
      // Actualizamos la lista local
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      setError("Error al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    setEditingUser({
      ...editingUser,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <SpinnerLazy />;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Encabezado y Buscador */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-bold text-gray-800">Personal de Limpieza</h1>
          <p className="text-gray-500 text-sm">Administra cuentas y accesos de camareras</p>
        </div>

        <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
            </div>
            <input 
                type="text" 
                className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-xl bg-gray-50 focus:ring-blue-500 focus:border-blue-500 shadow-sm" 
                placeholder="Buscar por nombre..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Grid de Personal (Cards Responsivas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col transition hover:shadow-md">
            
            <div className="flex items-start justify-between mb-4">
                {/* Avatar / Icono */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold uppercase">
                        {user.username.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">{user.username}</h3>
                        <p className="text-xs text-gray-500">Camarera</p>
                    </div>
                </div>
                
                {/* Toggle Switch de Estado */}
                <label className="inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={user.status}
                        onChange={() => handleStatusChange(user)}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>

            <div className="mb-6 flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${user.status ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className={user.status ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                        {user.status ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
            </div>

            <button 
                onClick={() => handleEditClick(user)}
                className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm transition flex justify-center items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                Editar Datos
            </button>
          </div>
        ))}

        {filteredUsers.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p>No se encontraron camareras con ese nombre.</p>
            </div>
        )}
      </div>

      {/* MODAL DE EDICIÓN */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800">Editar Usuario</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                
                <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                        <input
                            type="text"
                            name="username"
                            value={editingUser.username}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            name="email"
                            value={editingUser.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
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
                            className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;