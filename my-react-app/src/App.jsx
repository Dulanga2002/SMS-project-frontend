import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CareersPage from './pages/CareersPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './components/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>

          {/* Public Route */}
          <Route path="/" element={<HomePage />} />

          {/* Static Info Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/careers" element={<CareersPage />} />

          {/* CUSTOMER ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* ADMIN ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/adminDashboard" element={<AdminDashboard />} />
          </Route>

          {/* STAFF ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
            <Route path="/staffDashboard" element={<StaffDashboard />} />
          </Route>

        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
