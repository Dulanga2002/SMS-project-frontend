import { useState, useEffect } from 'react';
import { Scissors, User, LogOut, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import ServiceSelection from './ServiceSelection';
import AppointmentList from './AppointmentList';


export default function CustomerDashboard() {
  const { appointments, currentUser, loading } = useApp();
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');



  const handleProfileClick = () => {
    navigate('/profile');
  };

  const customerAppointments = appointments.filter(apt => apt.customerId === user?.id);
  const upcomingCount = customerAppointments.filter(apt => 
    apt.status === 'confirmed' || apt.status === 'pending'
  ).length;
  const completedCount = customerAppointments.filter(apt => apt.status === 'completed').length;

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

            {/* Services */}
            <ServiceSelection />
          </>
        )}

        {activeTab === 'appointments' && (
          <AppointmentList appointments={customerAppointments} userRole="customer" />
        )}
      </div>
    </div>
  );
}
