import { useEffect, useState } from 'react';
import { Scissors, User, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import AppointmentList from '../components/AppointmentList';
import { UserButton, useAuth } from '@clerk/clerk-react';
import { getStaffAppointments } from '../services/api';

export default function StaffDashboard() {
  const { currentUser, logout } = useApp();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedule');
  const [staffAppointments, setStaffAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/staff-profile');
  };

  const getStatusValue = (appointment) => {
    const rawStatus = appointment?.status || appointment?.state;
    if (typeof rawStatus === 'string' && rawStatus.trim()) {
      return rawStatus.toLowerCase();
    }
    return 'pending';
  };

  const getDateKey = (value) => {
    if (!value) {
      return null;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchStaffAppointments = async () => {
      try {
        setAppointmentsLoading(true);
        setAppointmentsError('');
        const token = await getToken();
        const data = await getStaffAppointments(token);
        const appointmentsData = Array.isArray(data) ? data : data.appointments || [];
        setStaffAppointments(appointmentsData);
      } catch (error) {
        console.error('Failed to load staff appointments:', error);
        setAppointmentsError('Failed to load appointments. Please try again.');
        setStaffAppointments([]);
      } finally {
        setAppointmentsLoading(false);
      }
    };

    fetchStaffAppointments();
  }, [getToken]);

  const scheduledAppointments = staffAppointments.filter(
    (appointment) => {
      const status = getStatusValue(appointment);
      return status === 'confirmed' || status === 'pending';
    },
  );
  const completedAppointments = staffAppointments.filter(
    (appointment) => getStatusValue(appointment) === 'completed',
  );

  const filteredAppointments = filterDate
    ? staffAppointments.filter((appointment) => {
        const dateKey = getDateKey(appointment?.appointmentDate || appointment?.date);
        return dateKey === filterDate;
      })
    : staffAppointments;

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
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 hover:bg-purple-50 p-2 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm">{currentUser?.name}</p>
                  <p className="text-xs text-gray-600">Staff</p>
                </div>
              </button>
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setActiveTab('schedule')}
            className="bg-green-50 rounded-lg p-6 border border-green-200 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Scheduled</p>
                <p className="text-4xl text-green-700">{scheduledAppointments.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-green-600" />
            </div>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className="bg-blue-50 rounded-lg p-6 border border-blue-200 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 mb-1">Completed</p>
                <p className="text-4xl text-blue-700">{completedAppointments.length}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-blue-600" />
            </div>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-4 border-b">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 px-4 transition-colors ${
              activeTab === 'schedule'
                ? 'border-b-2 border-purple-600 text-purple-600 font-semibold'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-lg border">
            <div className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className="text-2xl">Appointments Schedule</h2>
                  <p className="text-sm text-gray-500">Filter by date to focus on a single day.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-sm text-gray-600" htmlFor="staff-appointments-date">
                    Date
                  </label>
                  <input
                    id="staff-appointments-date"
                    type="date"
                    value={filterDate}
                    onChange={(event) => setFilterDate(event.target.value)}
                    className="border rounded-md px-3 py-2 text-sm"
                  />
                  {filterDate && (
                    <button
                      onClick={() => setFilterDate('')}
                      className="text-sm text-purple-600 hover:text-purple-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {appointmentsLoading ? (
                <div className="bg-gray-50 border rounded-lg p-8 text-center text-gray-600">
                  Loading appointments...
                </div>
              ) : appointmentsError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center text-red-600">
                  {appointmentsError}
                </div>
              ) : (
                <AppointmentList appointments={filteredAppointments} userRole="staff" />
              )}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && completedAppointments.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl mb-4">Completed Appointments</h2>
            <AppointmentList appointments={completedAppointments} userRole="staff" />
          </div>
        )}
      </div>
    </div>
  );
}