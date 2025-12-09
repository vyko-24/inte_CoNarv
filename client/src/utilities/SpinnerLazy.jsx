import React from 'react';

const SpinnerLazy = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="relative flex items-center justify-center">
        {/* Anillo exterior suave (Track) */}
        <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
        
        {/* Anillo de carga giratorio (Indicador) */}
        <div className="absolute w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        
        {/* Centro pulsante (Corazón de la app) */}
        <div className="absolute">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-ping opacity-75"></div>
        </div>
      </div>
      
      {/* Texto de carga */}
      <div className="mt-6 flex flex-col items-center">
        <h3 className="text-blue-600 font-bold text-xl tracking-tight">RomMila</h3>
        <p className="text-gray-400 text-sm font-medium animate-pulse">Preparando todo...</p>
      </div>
    </div>
  )
}

export default SpinnerLazy;