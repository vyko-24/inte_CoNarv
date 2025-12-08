import React, { useEffect, useState } from "react";

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Escuchar el evento 'beforeinstallprompt'
    const handler = (e) => {
      // 1. Evitar que Chrome muestre el prompt automático (opcional, para tener control total)
      e.preventDefault();
      // 2. Guardar el evento para dispararlo después
      setDeferredPrompt(e);
      // 3. Mostrar nuestro botón
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // 1. Mostrar el prompt nativo
    deferredPrompt.prompt();

    // 2. Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Usuario decidió: ${outcome}`);

    // 3. Limpiar
    setDeferredPrompt(null);
    setShowButton(false);
  };

  // Si la app ya está instalada o no es compatible, no mostramos nada
  if (!showButton) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition w-full justify-center animate-bounce"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
      Instalar App
    </button>
  );
};

export default InstallButton;