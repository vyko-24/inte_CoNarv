import React, { createContext, useEffect, useState, useContext } from 'react';
import { messaging, VAPID_KEY } from '../config/firebase-config';
import { getToken, onMessage } from 'firebase/messaging';
import { updateFcmTokenService } from '../services/auth/authservices';
import AuthContext from './authcontext';
import { AlertHelper } from '../utilities/AlertHelper';


const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // 1. Cargar historial del Storage al iniciar
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("notification_history") || "[]");
        setNotifications(stored);
        setUnreadCount(stored.filter(n => !n.read).length);
    }, []);

    // 2. Obtener Token y enviarlo al Backend
    useEffect(() => {
        const requestPermission = async () => {
            if (!user) return; // Solo si hay usuario logueado

            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
                    if (currentToken) {
                        console.log("FCM Token:", currentToken);
                        // ENVIAR AL BACKEND
                        await updateFcmTokenService(user.id, currentToken);
                    }
                }
            } catch (error) {
                console.error("Error con permisos de notificación", error);
            }
        };

        requestPermission();
    }, [user]);

    // 3. Escuchar mensajes en Primer Plano (Foreground)
    useEffect(() => {
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log("Mensaje recibido en foreground: ", payload);
            
            // Crear objeto de notificación
            const newNotification = {
                id: Date.now(),
                title: payload.notification.title,
                body: payload.notification.body,
                date: new Date().toISOString(),
                read: false,
                type: 'info' // Puedes personalizar según el body
            };

            // Guardar en Estado y LocalStorage
            saveNotification(newNotification);
            AlertHelper.showAlert(`🔔 ${newNotification.title}: ${newNotification.body}`, "info", 10000)
        });

        return () => {
            unsubscribe();
        };
    }, []);

    // Helper para guardar
    const saveNotification = (notif) => {
        setNotifications(prev => {
            const updated = [notif, ...prev];
            localStorage.setItem("notification_history", JSON.stringify(updated));
            return updated;
        });
        setUnreadCount(prev => prev + 1);
    };

    // Marcar como leídas
    const markAllAsRead = () => {
        const updated = notifications.map(n => ({...n, read: true}));
        setNotifications(updated);
        setUnreadCount(0);
        localStorage.setItem("notification_history", JSON.stringify(updated));
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;