import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AppRoutes from './routes';
import ChatbotWidget from '../components/ui/ChatbotWidget';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <Footer />
          <ChatbotWidget />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
