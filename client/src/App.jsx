import AppRouter from './components/AppRouter.jsx'
import { AuthProvider} from "./AuthContext.jsx";

function App() {
  return (
    <>
      <AuthProvider>
        <AppRouter/>
      </AuthProvider>
    </>
  )
}

export default App
