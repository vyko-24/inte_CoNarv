const SpinnerLazy = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-600 border-t-yellow-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-yellow-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="ml-4 text-yellow-500 font-semibold text-lg">Cargando la operación...</p>
    </div>
  )
}

export default SpinnerLazy
