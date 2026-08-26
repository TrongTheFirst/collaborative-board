import AppRouter from './components/AppRouter.jsx'
import { AuthProvider} from "./contexts/AuthContext.jsx";
import { SessionProvider } from "./contexts/SesssionContext.jsx";

function App() {
  return (
    <>
      <AuthProvider>
        <SessionProvider>
            <AppRouter/>
        </SessionProvider>
      </AuthProvider>
    </>
  )
}

export default App
