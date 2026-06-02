import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import HomePage from './pages/HomePage';
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
