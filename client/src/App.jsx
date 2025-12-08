import "./tailwind.css"
import AppRouter from "./router/AppRouter"
import { NetworkProvider } from "./context/NetworkContext"
import { NotificationProvider } from "./context/NotificationContext"

function App() {

  return (
   <div>
    <NetworkProvider>
      <NotificationProvider>
        <AppRouter />
      </NotificationProvider>
    </NetworkProvider>
   </div>
  )
}

export default App
