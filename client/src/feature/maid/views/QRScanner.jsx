import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import Alert from "../../../components/Alert";

const QRScanner = () => {
    const navigate = useNavigate();
    const [scanResult, setScanResult] = useState(null);
    const [manualId, setManualId] = useState("");
    const [error, setError] = useState(null);
    
    // Usamos una referencia para evitar reinicializaciones dobles en React StrictMode
    const scannerRef = useRef(null);

    useEffect(() => {
        // Configuración del Escáner
        // fps: Frames por segundo (menos consume menos batería)
        // qrbox: Tamaño de la caja de enfoque
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ]
        };

        // 'reader' es el ID del div donde se renderizará
        const scanner = new Html5QrcodeScanner("reader", config, false);
        scannerRef.current = scanner;

        const onScanSuccess = (decodedText, decodedResult) => {
            // Lógica de validación
            // Suponemos que el QR contiene SOLO el ID numérico de la habitación (ej: "4")
            // O quizás un JSON. Aquí validamos si es un número.
            
            console.log(`Código escaneado: ${decodedText}`);
            
            // Limpiamos el escáner antes de navegar para liberar la cámara
            scanner.clear().then(() => {
                // Si tu QR tiene una URL completa, extrae el ID.
                // Si es solo el ID, navega directo.
                // Validamos que sea un número para evitar navegar a basura
                if (!isNaN(decodedText)) {
                    navigate(`/room/${decodedText}`);
                } else {
                    setError("El código QR no contiene un ID de habitación válido.");
                    // Reiniciar escáner tras un error visual brevemente sería ideal,
                    // pero aquí pedimos reintentar manual o refrescar.
                }
            }).catch(err => {
                console.error("Error al detener cámara", err);
            });
        };

        const onScanFailure = (error) => {
            // Esto se ejecuta constantemente si no detecta código. 
            // No pongas console.log aquí o saturarás la consola.
        };

        scanner.render(onScanSuccess, onScanFailure);

        // Cleanup al desmontar
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Error limpiando scanner", error);
                });
            }
        };
    }, [navigate]);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualId) {
            navigate(`/room/${manualId}`);
        }
    };

    return (
        <div className="p-4 flex flex-col h-full bg-gray-50">
            <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">Escanear Habitación</h1>

            {/* Contenedor del Escáner */}
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
                {/* DIV IMPORTANTE: Aquí se monta la cámara */}
                <div id="reader" className="w-full"></div>
                
                <p className="text-center text-xs text-gray-500 mt-2 p-2">
                    Apunta la cámara al código QR ubicado en la puerta o interior de la habitación.
                </p>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            {/* Opción Manual (Fallback) */}
            <div className="mt-auto bg-white p-6 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 text-center">
                    ¿Problemas con la cámara?
                </h3>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <input 
                        type="number" 
                        placeholder="ID Habitación"
                        className="flex-1 p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg focus:ring-blue-500 focus:border-blue-500"
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value)}
                    />
                    <button 
                        type="submit"
                        disabled={!manualId}
                        className="bg-blue-600 text-white px-6 rounded-xl font-bold disabled:opacity-50 active:scale-95 transition"
                    >
                        Ir
                    </button>
                </form>
            </div>
        </div>
    );
};

export default QRScanner;