import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from './types/user';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import HowItWorks from './pages/HowItWorks';
import Professional from './pages/Professional';
import RegisterClient from './components/RegisterClient';
import RegisterCaregiver from './components/RegisterCaregiver';
import Profile from './components/Profile';
import ProfileCaregiver from './components/Profile/ProfileCaregiver';
import Search from './components/Search';
import ClientDashboard from './components/Dashboard/ClientDashboard';
import AppointmentsPage from './components/Appointments/AppointmentsPage';
import PaymentPage from './components/Payments/PaymentPage';
import FavoritesPage from './components/FavoritesPage';
import CaregiverDashboard from './components/Dashboard/CaregiverDashboard';
import BookingForm from './components/Booking/BookingForm';
import CaregiverApplicationForm from './components/Booking/CaregiverApplicationForm.tsx';
import PrivateRoute from './components/PrivateRoute';

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  const [user, loading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Toaster position="top-right" />
        <Navbar />

        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/professional" element={<Professional />} />
            <Route path="/register/client" element={user ? <Navigate to="/dashboard" /> : <RegisterClient />} />
            <Route path="/register/caregiver" element={user ? <Navigate to="/dashboard" /> : <RegisterCaregiver />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  {userProfile?.role === 'caregiver' ? (
                    <CaregiverDashboard />
                  ) : (
                    <ClientDashboard />
                  )}
                </PrivateRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <PrivateRoute>
                  {userProfile?.role === 'caregiver' ? (
                    <AppointmentsPage />
                  ) : (
                    <Navigate to="/dashboard" />
                  )}
                </PrivateRoute>
              }
            />
            <Route
              path="/search"
              element={
                <PrivateRoute>
                  <Search />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/caregiver"
              element={
                <PrivateRoute>
                  <ProfileCaregiver />
                </PrivateRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <PrivateRoute>
                  <FavoritesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <PrivateRoute>
                  <PaymentPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/booking"
              element={
                <PrivateRoute requiredRole="client">
                  <BookingForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/apply"
              element={
                <PrivateRoute>
                  <CaregiverApplicationForm />
                </PrivateRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-gray-800 text-white py-4 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p> {new Date().getFullYear()} CareConnect. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
