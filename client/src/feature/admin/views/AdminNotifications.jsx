import React, { useContext } from 'react';
import NotificationContext from '../../../context/NotificationContext';

const AdminNotifications = () => {
  const { notifications, markAllAsRead } = useContext(NotificationContext);

  // Helper para fecha
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('es-MX', { 
        weekday: 'long', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header con botón de acción */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Centro de Notificaciones</h1>
            <p className="text-gray-500 text-sm">Historial de alertas del sistema y reportes</p>
        </div>
        
        {notifications.some(n => !n.read) && (
            <button 
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium text-sm"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Marcar todo como leído
            </button>
        )}
      </div>

      {/* Lista de Notificaciones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                </div>
                <p>No hay notificaciones en el historial.</p>
            </div>
        ) : (
            <div className="divide-y divide-gray-50">
                {notifications.map((notif) => (
                    <div 
                        key={notif.id} 
                        className={`p-6 transition duration-200 hover:bg-gray-50 flex gap-4 ${
                            !notif.read ? 'bg-blue-50/50' : ''
                        }`}
                    >
                        {/* Icono Status */}
                        <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${!notif.read ? 'bg-blue-500 shadow-sm shadow-blue-300' : 'bg-gray-200'}`}></div>
                        
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className={`text-base ${!notif.read ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                                    {notif.title}
                                </h3>
                                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                                    {formatDate(notif.date)}
                                </span>
                            </div>
                            <p className={`mt-1 text-sm ${!notif.read ? 'text-gray-800' : 'text-gray-500'}`}>
                                {notif.body}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;