import { useState, useEffect } from 'react';
import { Scissors, User, LogOut, Clock, Calendar, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useUser, UserButton, useAuth } from '@clerk/clerk-react';
import BookAppointmentModal from './BookAppointmentModal';
import AppointmentList from './AppointmentList';
import { getMyAppointments } from '../services/api';


export default function CustomerDashboard() {
  const { appointments, currentUser, loading } = useApp();
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [myAppointments, setMyAppointments] = useState([]);
  const [token, setToken] = useState(null);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const customerAppointments = appointments.filter(apt => apt.customerId === user?.id);
  const upcomingCount = customerAppointments.filter(apt => 
    apt.status === 'confirmed' || apt.status === 'pending'
  ).length;
  const completedCount = customerAppointments.filter(apt => apt.status === 'completed').length;

  useEffect(() => {
    const fetchToken = async () => {
      if (currentUser) {
        const token = await getToken();
        setToken(token);
      }
    }
    fetchToken();

    const fetchAppointments = async () => {
      if (token) {
        try {
          const data = await getMyAppointments(token);
          setMyAppointments(data);
        } catch (error) {
          console.error('Error fetching appointments:', error);
        }
      }
    };
    fetchAppointments();

  }, [currentUser, token]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="w-8 h-8 text-purple-600" />
              <span className="text-2xl text-purple-600">Aura</span>
            </div>
            
            <div className="flex items-center gap-4">
              {loading && (
                <span className="text-xs text-gray-500">Syncing...</span>
              )}
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 hover:bg-purple-50 p-2 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm">{currentUser?.name || user?.fullName || user?.primaryEmailAddress?.emailAddress}</p>
                  <p className="text-xs text-gray-600">{currentUser?.role || 'Customer'}</p>
                </div>
              </button>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-purple-600'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'appointments'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-purple-600'
              }`}
            >
              My Appointments
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Upcoming</p>
                    <p className="text-4xl">{upcomingCount}</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-4xl text-green-600">{completedCount}</p>
                  </div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Book Appointment Section */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-8 text-white mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Ready for a new look?</h2>
                  <p className="text-purple-100 mb-4">
                    Book your appointment now and select multiple services
                  </p>
                </div>
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Book Appointment
                </button>
              </div>
            </div>

            {/* Recent Appointments Preview */}
            {customerAppointments.length > 0 && (
              <div className="bg-white rounded-lg p-6 border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Recent Appointments</h3>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {customerAppointments.slice(0, 3).map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium">{apt.serviceName}</p>
                          <p className="text-sm text-gray-600">{apt.date} at {apt.time}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'appointments' && (
          <AppointmentList appointments={myAppointments} userRole="customer" />
        )}
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
}
