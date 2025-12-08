import React, { useContext } from 'react';
import NotificationContext from '../../context/NotificationContext';

const NotificationsView = () => {
  const { notifications, markAllAsRead } = useContext(NotificationContext);

  // Formatear fecha amigable
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="p-4 max-w-3xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Notificaciones</h1>
                <p className="text-gray-500 text-sm">Historial de avisos y alertas</p>
            </div>
            {notifications.length > 0 && (
                <button 
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    Marcar todo leído
                </button>
            )}
        </div>

        <div className="space-y-4">
            {notifications.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-400">No tienes notificaciones nuevas.</p>
                </div>
            ) : (
                notifications.map((notif) => (
                    <div 
                        key={notif.id} 
                        className={`p-4 rounded-xl border transition-all ${
                            notif.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100 shadow-sm'
                        }`}
                    >
                        <div className="flex gap-3">
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.read ? 'bg-gray-300' : 'bg-blue-600'}`}></div>
                            <div className="flex-1">
                                <h4 className={`text-sm ${notif.read ? 'font-semibold text-gray-700' : 'font-bold text-gray-900'}`}>
                                    {notif.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                    {notif.body}
                                </p>
                                <p className="text-xs text-gray-400 mt-2 text-right">
                                    {formatDate(notif.date)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default NotificationsView;