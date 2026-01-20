import { useApp } from '../context/AppContext';
import CustomerDashboard from '../components/CustomerDashboard';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { currentUser, loading } = useApp();

  useEffect(() => {
    if (currentUser) {
      console.log('✅ User synced with MongoDB:', currentUser);
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Syncing your profile...</p>
          </div>
        </div>
      ) : (
        <CustomerDashboard />
      )}
    </div>
  );
}
