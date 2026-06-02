import { useApp } from '../context/AppContext';
import CustomerDashboard from '../components/CustomerDashboard';
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';


export default function DashboardPage() {
  const { currentUser, loading } = useApp();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchToken = async () => {
      if (currentUser) {
        const token = await getToken();
        console.log('🔑 Auth Token:', token);
        console.log('✅ User synced with MongoDB:', currentUser);
      }
    };

    fetchToken();
  }, [currentUser, getToken]);



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
