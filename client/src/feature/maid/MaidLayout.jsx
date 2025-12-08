import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AuthContext from "../../context/authcontext";
import { useContext } from "react";
import NotificationContext from "../../context/NotificationContext";
import InstallButton from "../../components/InstallButton";

const MaidLayout = () => {
  const location = useLocation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { unreadCount } = useContext(NotificationContext);

    const { dispatch } = useContext(AuthContext);
    const navigate = useNavigate();
  
    const handleLogout = () => {
      dispatch({ type: "LOGOUT" });
      navigate("/login");
    };

  // Detector de conexión
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    }; 
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header Simple */}
      <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center z-10 sticky top-0">
        <h1 className="text-lg font-bold">RomMila Staff</h1>
        {isOffline && (
            <div className="flex items-center gap-1 bg-red-500 px-2 py-1 rounded text-xs font-bold animate-pulse">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                <span>Offline</span>
            </div>
        )}
        <div>
          <div className="ml-auto"> 
            <InstallButton />
         </div>
        </div>
        <div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-950 hover:bg-red-500 hover:text-white p-2 rounded transition bg-white"
          >
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Contenido Scrollable */}
      <main className="flex-1 overflow-y-auto pb-20"> {/* pb-20 para no tapar el nav */}
        <Outlet />
      </main>

      {/* Bottom Navigation Fijo */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-around py-3 z-20 safe-area-bottom">
        <NavItem 
          to="/" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>}
          label="Tareas"
          isActive={location.pathname.includes("/")}
        />
        
        {/* Botón Escáner Central Destacado */}
        <div className="relative -top-6">
            <Link to="/scanner" className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center border-4 border-gray-50">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
            </Link>
        </div>

        <NavItem 
          to="/notifications" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>}
          label="Avisos"
          isActive={location.pathname.includes("/notifications")}
        />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
            {unreadCount}
          </span>
      )}
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon, label, isActive }) => (
  <Link to={to} className={`flex flex-col items-center gap-1 ${isActive ? "text-blue-600" : "text-gray-400"}`}>
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </Link>
);

export default MaidLayout;