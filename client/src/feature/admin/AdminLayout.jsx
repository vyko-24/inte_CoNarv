import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import AuthContext from "../../context/authcontext";
import NotificationContext from "../../context/NotificationContext";
import InstallButton from "../../components/InstallButton";

const AdminLayout = () => {
  const { unreadCount } = useContext(NotificationContext);
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Estado para controlar el menú en móvil
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  // Función para cerrar el menú al hacer clic en un enlace (UX móvil)
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen backdrop-blur-sm bg-gray-50 overflow-hidden">

      {/* --- OVERLAY PARA MÓVIL (Fondo oscuro) --- */}
      {/* Solo visible cuando el sidebar está abierto en móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-opacity-50 md:hidden transition-opacity "
          onClick={closeSidebar}
        ></div>
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:flex md:flex-col
        `}
      >
        {/* Cabecera del Sidebar */}
        <div className="p-6 text-center border-b border-gray-100 relative">
          <h2 className="text-2xl font-extrabold text-blue-600 tracking-tight">RomMila</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mt-1">Administración</p>

          {/* Botón cerrar (Solo móvil) */}
          <button
            onClick={closeSidebar}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 md:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Dashboard */}
          <NavLink
            to="/"
            label="Dashboard"
            icon="📊"
            isActive={location.pathname === "/admin"}
            onClick={closeSidebar}
          />

          {/* Habitaciones */}
          <NavLink
            to="/rooms"
            label="Habitaciones"
            icon="🛏️"
            isActive={location.pathname.includes("/rooms")}
            onClick={closeSidebar}
          />

          {/* Incidencias */}
          <NavLink
            to="/incidents"
            label="Incidencias"
            icon="⚠️"
            isActive={location.pathname.includes("/incidents")}
            onClick={closeSidebar}
          />

          {/* Personal */}
          <NavLink
            to="/staff"
            label="Personal"
            icon="👥"
            isActive={location.pathname.includes("/staff")}
            onClick={closeSidebar}
          />

          {/* Notificaciones */}
          <Link
            to="/notifications"
            onClick={closeSidebar}
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${location.pathname.includes("/notifications")
              ? "bg-blue-50 text-blue-700 font-bold"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl group-hover:scale-110 transition-transform">🔔</span>
              <span>Avisos</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                {unreadCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 md:bg-white">
          <div className="mb-4">
            <InstallButton />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 p-3 rounded-xl transition font-medium border border-transparent hover:border-red-100"
          >
            <span>🚪</span> Cerrar Sesión
          </button>
          <InstallButton />
        </div>
        <div>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* HEADER MÓVIL (Solo visible en md:hidden) */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden z-10">
          <div className="flex items-center gap-3">
            {/* Botón Hamburguesa */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <span className="text-lg font-bold text-blue-600">RomMila Admin</span>
          </div>

          {/* Indicador de notificaciones en header móvil (opcional pero útil) */}
          {unreadCount > 0 && (
            <Link to="/notifications" className="relative p-2 text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
            </Link>
          )}
        </header>

        {/* VISTA RENDERIZADA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Componente NavLink actualizado para aceptar onClick (para cerrar menú)
const NavLink = ({ to, label, icon, isActive, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
      ? "bg-blue-50 text-blue-700 font-bold shadow-sm"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
  >
    <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
    <span>{label}</span>
  </Link>
);

export default AdminLayout;