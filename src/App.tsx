import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import FeedPage from './pages/FeedPage';
import HarvestsPage from './pages/HarvestsPage';
import ClubPage from './pages/ClubPage';
import StandsPage from './pages/StandsPage';
import BookingsPage from './pages/BookingsPage';
import NewBookingPage from './pages/NewBookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import InviteMemberPage from './pages/InviteMemberPage';
import MapPage from './pages/MapPage';
import CreateClubPage from './pages/CreateClubPage';
import ClubDiscoveryPage from './pages/ClubDiscoveryPage';
import CheckInOutPage from './pages/CheckInOutPage';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import BottomTabBar from './components/BottomTabBar';
import Footer from './components/Footer';
import ProfilePage from './pages/ProfilePage';
import FeaturesPage from './pages/FeaturesPage';
import HelpPage from './pages/HelpPage';
import SafetyPage from './pages/SafetyPage';
import ConservationPage from './pages/ConservationPage';
import CommunityPage from './pages/CommunityPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CookiesPage from './pages/CookiesPage';

import LandingPage from './pages/LandingPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile } = useAuth();
  if (!user || !profile?.isSuperAdmin) return <Navigate to="/" />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#12140e] text-white">
          <Routes>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-24 sm:pb-8">
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/feed" element={<FeedPage />} />
                        <Route path="/club" element={<ClubPage />} />
                        <Route path="/harvests" element={<HarvestsPage />} />
                        <Route path="/check-in" element={<CheckInOutPage />} />
                        <Route path="/bookings" element={<BookingsPage />} />
                        <Route path="/bookings/new" element={<NewBookingPage />} />
                        <Route path="/bookings/mine" element={<MyBookingsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/members/invite" element={<InviteMemberPage />} />
                        <Route path="/clubs/create" element={<CreateClubPage />} />
                        <Route path="/clubs/discover" element={<ClubDiscoveryPage />} />
                        <Route path="/features" element={<FeaturesPage />} />
                        <Route path="/help" element={<HelpPage />} />
                        <Route path="/safety" element={<SafetyPage />} />
                        <Route path="/conservation" element={<ConservationPage />} />
                        <Route path="/community" element={<CommunityPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/cookies" element={<CookiesPage />} />
                        <Route
                          path="/admin/*"
                          element={
                            <AdminRoute>
                              <AdminDashboard />
                            </AdminRoute>
                          }
                        />
                      </Routes>
                    </main>
                    <Footer />
                    <BottomTabBar />
                  </div>
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
