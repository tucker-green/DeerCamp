import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import HarvestPage from './pages/HarvestPage';
import StandsPage from './pages/StandsPage';
import BookingsPage from './pages/BookingsPage';
import NewBookingPage from './pages/NewBookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#12140e] text-white">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="container mx-auto px-4 pt-24 pb-8">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/harvests" element={<HarvestPage />} />
                        <Route path="/stands" element={<StandsPage />} />
                        <Route path="/bookings" element={<BookingsPage />} />
                        <Route path="/bookings/new" element={<NewBookingPage />} />
                        <Route path="/bookings/mine" element={<MyBookingsPage />} />
                      </Routes>
                    </main>
                  </>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
