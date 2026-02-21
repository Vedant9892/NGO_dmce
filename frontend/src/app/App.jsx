import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AppRoutes from './routes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="theme-page flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pt-20">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
