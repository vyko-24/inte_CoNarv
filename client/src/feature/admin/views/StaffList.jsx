import React, { useEffect, useState } from "react";
import { getAllUsers, updateUser, changeUserStatus, createUser } from "../../../services/user/userService";
import SpinnerLazy from "../../../utilities/SpinnerLazy";
import Alert from "../../../components/Alert";

const StaffList = () => {
  // Datos y UI
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para el Modal (Crear / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // null = Crear, Objeto = Editar
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "ROLE_MAID" // Valor por defecto
  });

  // --- CARGA INICIAL ---
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

  // --- LÓGICA DE FILTRADO ---
  const filteredUsers = users.filter((user) => {
    // Opcional: Si quieres ver a los admins para editarlos, quita este filtro.
    // Si solo quieres gestionar camareras, déjalo.
    if (user.role === "ROLE_ADMIN") return false;

    const term = searchTerm.toLowerCase();
    return user.username.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
  });

  // --- MANEJO DEL MODAL ---
  const openCreateModal = () => {
    setCurrentUser(null);
    setFormData({ username: "", email: "", role: "ROLE_MAID" });
    setIsModalOpen(true);
    setError(null);
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role || "ROLE_MAID"
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // --- ACCIONES (CRUD) ---

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentUser) {
        // MODO EDICIÓN
        const updatedModel = { ...currentUser, ...formData };
        const result = await updateUser(currentUser.id, updatedModel);
        
        // Actualizar lista local
        setUsers(prev => prev.map(u => u.id === result.id ? result : u));
      } else {
        // MODO CREACIÓN
        const newModel = { ...formData, status: true }; // Status true por defecto
        const result = await createUser(newModel);
        
        // Agregar a lista local
        setUsers(prev => [...prev, result]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      // El AlertHelper ya muestra el toast, aquí solo logueamos o mostramos error estático si falla muy feo
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (user) => {
    try {
      // Optimismo UI
      const newStatus = !user.status;
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      
      await changeUserStatus(user.id);
    } catch (err) {
      // Revertir si falla
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: !user.status } : u));
      console.error("Error cambiando status", err);
    }
  };

  if (loading) return <SpinnerLazy />;

  return (
    <div className="space-y-6 pb-20">
      
      {/* HEADER Y BUSCADOR */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-bold text-gray-800">Personal de Limpieza</h1>
          <p className="text-gray-500 text-sm">Gestiona usuarios y accesos</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
            {/* Input Buscador */}
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

            {/* Botón Nuevo */}
            <button 
                onClick={openCreateModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                <span className="hidden sm:inline">Nuevo</span>
            </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* GRID DE PERSONAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col transition hover:shadow-md">
            
            <div className="flex items-start justify-between mb-4">
                {/* Avatar */}
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold uppercase ${
                        user.status ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                        {user.username.charAt(0)}
                    </div>
                    <div>
                        <h3 className={`font-bold text-lg leading-tight ${user.status ? 'text-gray-800' : 'text-gray-400'}`}>
                            {user.username}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {user.role === 'ROLE_ADMIN' ? 'Administrador' : 'Camarera'}
                        </p>
                    </div>
                </div>
                
                {/* Switch Estado */}
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

            <div className="mb-6 flex-1 space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
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
                onClick={() => openEditModal(user)}
                className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm transition flex justify-center items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                Editar Datos
            </button>
          </div>
        ))}

        {filteredUsers.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p>No se encontraron usuarios.</p>
            </div>
        )}
      </div>

      {/* MODAL (CREAR / EDITAR) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4  bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800">
                        {currentUser ? "Editar Usuario" : "Nuevo Personal"}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                            placeholder="Ej: mariaperez"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                        {!currentUser && (
                            <p className="text-xs text-gray-400 mt-1">La contraseña inicial será igual al nombre de usuario.</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="correo@ejemplo.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Rol */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol / Cargo</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                            <option value="ROLE_MAID">Camarera (Limpieza)</option>
                            <option value="ROLE_ADMIN">Administrador (Recepción)</option>
                        </select>
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
                            className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition disabled:opacity-50 flex justify-center items-center gap-2"
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

export default StaffList;