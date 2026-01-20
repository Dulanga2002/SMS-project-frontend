import { useState } from 'react';
import { Scissors, User, LogOut, Calendar, Clock, CheckCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import AppointmentList from '../components/AppointmentList';
import { UserButton } from '@clerk/clerk-react';

export default function StaffDashboard() {
  const { currentUser, logout, appointments, staff, updateStaff } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedule');
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/staff-profile');
  };

  // Find staff member associated with current user
  const staffMember = staff.find(s => s.userId === currentUser?.id);
  const staffAppointments = appointments.filter(apt => apt.staffId === staffMember?.id);

  const pendingAppointments = staffAppointments.filter(apt => apt.status === 'pending');
  const scheduledAppointments = staffAppointments.filter(apt => apt.status === 'confirmed');
  const completedAppointments = staffAppointments.filter(apt => apt.status === 'completed');

  // Define time slots (8 AM - 5 PM, excluding 12-1 PM lunch)
  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Helper function to check if a time slot has an appointment
  const getAppointmentForSlot = (day, time) => {
    return scheduledAppointments.find(apt => {
      const aptDate = new Date(apt.date);
      const dayName = aptDate.toLocaleDateString('en-US', { weekday: 'long' });
      return dayName === day && apt.timeSlot === time;
    });
  };

  // Helper function to check if a slot is marked as unavailable
  const isSlotUnavailable = (day, time) => {
    if (!staffMember) return false;
    
    // Get the current week's date for the day
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysMap = {
      'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
    const targetDay = daysMap[day];
    const diff = targetDay - currentDayOfWeek;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    return staffMember.unavailableSlots?.some(
      slot => slot.date === dateStr && slot.time === time
    ) || false;
  };

  // Toggle unavailable slot
  const toggleUnavailableSlot = (day, time) => {
    if (!staffMember) return;
    
    // Get the date for the day
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const daysMap = {
      'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
    const targetDay = daysMap[day];
    const diff = targetDay - currentDayOfWeek;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    const currentUnavailableSlots = staffMember.unavailableSlots || [];
    const slotIndex = currentUnavailableSlots.findIndex(
      slot => slot.date === dateStr && slot.time === time
    );
    
    let newUnavailableSlots;
    if (slotIndex >= 0) {
      // Remove the slot
      newUnavailableSlots = currentUnavailableSlots.filter((_, i) => i !== slotIndex);
    } else {
      // Add the slot
      newUnavailableSlots = [...currentUnavailableSlots, { date: dateStr, time }];
    }
    
    updateStaff(staffMember.id, { unavailableSlots: newUnavailableSlots });
  };

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
            onClick={() => setActiveTab('pending')}
            className="bg-yellow-50 rounded-lg p-6 border border-yellow-200 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 mb-1">Pending</p>
                <p className="text-4xl text-yellow-700">{pendingAppointments.length}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
          </button>

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
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-4 transition-colors ${
              activeTab === 'pending'
                ? 'border-b-2 border-purple-600 text-purple-600 font-semibold'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending
              {pendingAppointments.length > 0 && (
                <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingAppointments.length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-lg border overflow-x-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl">Weekly Schedule</h2>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
                    <span>Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                    <span>Not Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                    <span>Available</span>
                  </div>
                </div>
              </div>
              <div className="min-w-[800px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-3 bg-purple-50 text-left font-semibold">Time</th>
                      {days.map(day => (
                        <th key={day} className="border p-3 bg-purple-50 text-left font-semibold">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.slice(0, 4).map(time => (
                      <tr key={time}>
                        <td className="border p-3 bg-gray-50 font-medium text-sm">{time}</td>
                        {days.map(day => {
                          const appointment = getAppointmentForSlot(day, time);
                          const unavailable = isSlotUnavailable(day, time);
                          return (
                            <td key={`${day}-${time}`} className="border p-2">
                              {appointment ? (
                                <div className="bg-purple-100 border border-purple-300 rounded p-2 text-xs">
                                  <p className="font-semibold text-purple-900">{appointment.customerName}</p>
                                  <p className="text-purple-700">{appointment.serviceName}</p>
                                </div>
                              ) : unavailable ? (
                                <button
                                  onClick={() => toggleUnavailableSlot(day, time)}
                                  className="w-full bg-red-100 border border-red-300 rounded p-2 text-xs text-red-700 hover:bg-red-200 transition-colors"
                                >
                                  Not Available
                                </button>
                              ) : (
                                <button
                                  onClick={() => toggleUnavailableSlot(day, time)}
                                  className="w-full text-center text-gray-600 text-xs py-2 hover:bg-green-50 hover:text-green-700 border border-transparent hover:border-green-300 rounded transition-colors"
                                >
                                  Click to Mark Unavailable
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {/* Lunch Break Row */}
                    <tr>
                      <td className="border p-3 bg-gray-200 font-medium text-sm">12:00 PM</td>
                      {days.map(day => (
                        <td key={`${day}-lunch`} className="border p-2 bg-gray-100">
                          <div className="text-center text-gray-600 text-xs py-2">Lunch Break</div>
                        </td>
                      ))}
                    </tr>
                    {timeSlots.slice(4).map(time => (
                      <tr key={time}>
                        <td className="border p-3 bg-gray-50 font-medium text-sm">{time}</td>
                        {days.map(day => {
                          const appointment = getAppointmentForSlot(day, time);
                          const unavailable = isSlotUnavailable(day, time);
                          return (
                            <td key={`${day}-${time}`} className="border p-2">
                              {appointment ? (
                                <div className="bg-purple-100 border border-purple-300 rounded p-2 text-xs">
                                  <p className="font-semibold text-purple-900">{appointment.customerName}</p>
                                  <p className="text-purple-700">{appointment.serviceName}</p>
                                </div>
                              ) : unavailable ? (
                                <button
                                  onClick={() => toggleUnavailableSlot(day, time)}
                                  className="w-full bg-red-100 border border-red-300 rounded p-2 text-xs text-red-700 hover:bg-red-200 transition-colors"
                                >
                                  Not Available
                                </button>
                              ) : (
                                <button
                                  onClick={() => toggleUnavailableSlot(day, time)}
                                  className="w-full text-center text-gray-600 text-xs py-2 hover:bg-green-50 hover:text-green-700 border border-transparent hover:border-green-300 rounded transition-colors"
                                >
                                  Click to Mark Unavailable
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="space-y-8">
            {pendingAppointments.length > 0 && (
              <div>
                <h2 className="text-2xl mb-4">Pending Appointments</h2>
                <AppointmentList appointments={pendingAppointments} userRole="staff" />
              </div>
            )}

            {completedAppointments.length > 0 && (
              <div>
                <h2 className="text-2xl mb-4">Completed Appointments</h2>
                <AppointmentList appointments={completedAppointments} userRole="staff" />
              </div>
            )}

            {pendingAppointments.length === 0 && completedAppointments.length === 0 && (
              <div className="bg-white rounded-lg p-12 text-center border">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending or completed appointments</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}