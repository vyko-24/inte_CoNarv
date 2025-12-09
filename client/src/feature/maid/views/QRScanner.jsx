import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import Alert from "../../../components/Alert"; // Asegúrate que esta ruta sea correcta

const QRScanner = () => {
    const navigate = useNavigate();
    const [manualId, setManualId] = useState("");
    const [error, setError] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [permissionError, setPermissionError] = useState(false);
    
    // Referencia para la instancia del escáner
    const scannerRef = useRef(null);
    // Referencia para el input de archivos invisible
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Inicializar la instancia del escáner (sin iniciar cámara aún)
        const scannerId = "reader-custom";
        
        // Verificamos si ya existe para no duplicar
        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode(scannerId);
        }

        // Cleanup al salir del componente
        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(err => console.error("Error al detener", err));
            }
        };
    }, []);

    const onScanSuccess = (decodedText) => {
        console.log(`Código escaneado: ${decodedText}`);
        
        // Detenemos la cámara o proceso
        if (scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => {
                setIsScanning(false);
                processCode(decodedText);
            }).catch(err => console.error(err));
        } else {
            // Si viene de archivo
            processCode(decodedText);
        }
    };

    const processCode = (decodedText) => {
        if (!isNaN(decodedText)) {
            navigate(`/room/${decodedText}`);
        } else {
            setError("El código QR no es un ID de habitación válido.");
        }
    };

    const startCamera = () => {
        setError(null);
        setPermissionError(false);

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        // Intentar usar la cámara trasera
        scannerRef.current.start(
            { facingMode: "environment" }, 
            config, 
            onScanSuccess, 
            (errorMessage) => {
                // Error de lectura frame por frame (ignorar, es normal mientras busca)
            }
        ).then(() => {
            setIsScanning(true);
        }).catch(err => {
            console.error("Error al iniciar cámara", err);
            setIsScanning(false);
            // Detectar si fue error de permisos
            if (err.name === "NotAllowedError" || err.name === "NotFoundError") {
                setPermissionError(true);
            } else {
                setError("No se pudo iniciar la cámara. Intenta subir una foto o usar el ID manual.");
            }
        });
    };

    const stopCamera = () => {
        if (scannerRef.current) {
            scannerRef.current.stop().then(() => {
                setIsScanning(false);
            }).catch(err => console.error(err));
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        scannerRef.current.scanFile(file, true)
            .then(decodedText => {
                onScanSuccess(decodedText);
            })
            .catch(err => {
                console.error("Error escaneando archivo", err);
                setError("No se detectó ningún código QR en la imagen.");
            });
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualId) {
            navigate(`/room/${manualId}`);
        }
    };

    return (
        <div className="p-4 flex flex-col h-full bg-gray-50 overflow-y-auto">
            <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">Escanear Habitación</h1>

            {/* AREA DEL ESCÁNER */}
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden relative min-h-[300px] flex flex-col justify-center items-center">
                
                {/* Div donde se renderiza la cámara */}
                <div id="reader-custom" className="w-full"></div>

                {/* Si no está escaneando, mostramos los botones de acción */}
                {!isScanning && (
                    <div className="flex flex-col gap-4 w-full p-4 items-center">
                        {permissionError ? (
                            <div className="text-center p-4 bg-red-50 text-red-600 rounded-lg text-sm mb-2">
                                <p className="font-bold">Permiso de cámara denegado.</p>
                                <p>Por favor habilítalo en la configuración de tu navegador o usa la opción de subir foto.</p>
                            </div>
                        ) : (
                            <div className="mb-2 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                            </div>
                        )}

                        <button 
                            onClick={startCamera}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold active:scale-95 transition shadow-md flex items-center justify-center gap-2"
                        >
                            📷 Abrir Cámara
                        </button>
                        
                        <div className="w-full relative">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <button 
                                onClick={() => fileInputRef.current.click()}
                                className="w-full bg-white border-2 border-blue-100 text-blue-600 py-3 px-4 rounded-xl font-semibold active:scale-95 transition flex items-center justify-center gap-2"
                            >
                                🖼️ Subir Imagen de QR
                            </button>
                        </div>
                    </div>
                )}

                {/* Botón para detener escaneo si está activo */}
                {isScanning && (
                    <button 
                        onClick={stopCamera}
                        className="mt-4 bg-red-100 text-red-600 py-2 px-6 rounded-full text-sm font-bold z-10 mb-4"
                    >
                        Detener Cámara
                    </button>
                )}
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            {/* Opción Manual */}
            <div className="mt-auto bg-white p-6 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 text-center">
                    ¿Problemas con el código?
                </h3>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <input 
                        type="number" 
                        placeholder="ID Habitación"
                        className="flex-1 p-3 border border-gray-300 rounded-xl bg-gray-50 text-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
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