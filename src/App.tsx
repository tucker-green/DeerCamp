import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import FeedPage from './pages/FeedPage';
import HarvestPage from './pages/HarvestPage';
import StandsPage from './pages/StandsPage';
import BookingsPage from './pages/BookingsPage';
import NewBookingPage from './pages/NewBookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import MembersPage from './pages/MembersPage';
import InviteMemberPage from './pages/InviteMemberPage';
import MapPage from './pages/MapPage';
import PropertyManagementPage from './pages/PropertyManagementPage';
import CreateClubPage from './pages/CreateClubPage';
import ClubDiscoveryPage from './pages/ClubDiscoveryPage';
import TrophyBookPage from './pages/TrophyBookPage';
import CheckInOutPage from './pages/CheckInOutPage';
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
                        <Route path="/feed" element={<FeedPage />} />
                        <Route path="/harvests" element={<HarvestPage />} />
                        <Route path="/trophy-book" element={<TrophyBookPage />} />
                        <Route path="/check-in" element={<CheckInOutPage />} />
                        <Route path="/stands" element={<StandsPage />} />
                        <Route path="/map" element={<MapPage />} />
                        <Route path="/bookings" element={<BookingsPage />} />
                        <Route path="/bookings/new" element={<NewBookingPage />} />
                        <Route path="/bookings/mine" element={<MyBookingsPage />} />
                        <Route path="/members" element={<MembersPage />} />
                        <Route path="/members/invite" element={<InviteMemberPage />} />
                        <Route path="/property-management" element={<PropertyManagementPage />} />
                        <Route path="/clubs/create" element={<CreateClubPage />} />
                        <Route path="/clubs/discover" element={<ClubDiscoveryPage />} />
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
