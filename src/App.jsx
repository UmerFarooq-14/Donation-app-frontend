import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AppRouter from './router/AppRouter'

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <ToastContainer position="top-right" autoClose={2000} />
        <AppRouter />
    </div>
    </BrowserRouter>
  )
}

export default App
