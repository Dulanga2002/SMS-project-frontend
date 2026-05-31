import { useEffect, useState } from 'react';
import { Scissors, User, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import AppointmentList from '../components/AppointmentList';
import { UserButton, useAuth } from '@clerk/clerk-react';
import {
  getAssignedSlots,
  getStaffAppointments,
  markStaffSlotUnavailable,
  removeStaffSlotUnavailable,
} from '../services/api';

export default function StaffDashboard() {
  const { currentUser, logout } = useApp();
  const { getToken } = useAuth();
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedule');
  const [staffAppointments, setStaffAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [unavailableDate, setUnavailableDate] = useState('');
  const [unavailableTime, setUnavailableTime] = useState('');
  const [markingUnavailable, setMarkingUnavailable] = useState(false);
  const [removingUnavailable, setRemovingUnavailable] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [assignedSlots, setAssignedSlots] = useState([]);
  const [assignedSlotsLoading, setAssignedSlotsLoading] = useState(false);

  const staffUserId = currentUser?.clerkUserId || currentUser?.userId || currentUser?.id;

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

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 17; hour++) {
      if (hour === 12) continue;
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const formatTimeSlot = (time) => {
    const hour = parseInt(time.split(':')[0], 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const loadAssignedSlots = async () => {
    if (!staffUserId) {
      setAssignedSlots([]);
      return;
    }

    try {
      setAssignedSlotsLoading(true);
      const token = await fetchToken();
      const data = await getAssignedSlots(token);
      setAssignedSlots(Array.isArray(data?.assignedSlotes) ? data.assignedSlotes : []);
    } catch (error) {
      console.error('Failed to load assigned slots:', error);
      setAssignedSlots([]);
    } finally {
      setAssignedSlotsLoading(false);
    }
  };

  const handleMarkUnavailable = async () => {
    try {
      if (!unavailableDate || !unavailableTime) {
        setAvailabilityMessage('Please select both a date and time.');
        return;
      }

      setMarkingUnavailable(true);
      setAvailabilityMessage('');
      const token = await getToken();
      await markStaffSlotUnavailable(token, {
        appointmentDate: unavailableDate,
        appointmentTime: unavailableTime,
      });
      setAvailabilityMessage('Time slot marked as unavailable.');
      setUnavailableTime('');
      await loadAssignedSlots();
    } catch (error) {
      console.error('Failed to mark unavailable:', error);
      setAvailabilityMessage(error.message || 'Failed to mark slot unavailable.');
    } finally {
      setMarkingUnavailable(false);
    }
  };

  const handleMakeAvailable = async (appointmentDate, appointmentTime) => {
    try {
      setRemovingUnavailable(true);
      setAvailabilityMessage('');
      const token = await getToken();
      await removeStaffSlotUnavailable(token, {
        appointmentDate,
        appointmentTime,
      });
      setAvailabilityMessage('Time slot made available.');
      await loadAssignedSlots();
    } catch (error) {
      console.error('Failed to remove unavailable slot:', error);
      setAvailabilityMessage(error.message || 'Failed to make slot available.');
    } finally {
      setRemovingUnavailable(false);
    }
  };

  const fetchToken = async () => {
    try {
      const token = await getToken();
      console.log('Fetched token:', token);
      setToken(token);
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  }

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

  useEffect(() => {
    const fetchTimeSlotes = async () => {
      try {
        const token = await getToken();
        console.log('Fetching assigned slots with token:', token);
        const data = await getAssignedSlots(token);
        console.log('Received assigned slots data:', data);
        setAssignedSlots(data?.assignedSlotes || []);
        console.log('Assigned slots set in state:', assignedSlots);
      } catch (error) {
        console.error('Failed to load assigned slots:', error);
        setAssignedSlots([]);
      }
    }
    fetchTimeSlotes();
  }, [])

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

              <div className="mb-6 rounded-lg border bg-purple-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Mark Time Unavailable</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Choose a date and time to block it for booking.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="date"
                    value={unavailableDate}
                    onChange={(event) => {
                      setUnavailableDate(event.target.value);
                      setUnavailableTime('');
                      setAvailabilityMessage('');
                    }}
                    className="border rounded-md px-3 py-2 text-sm"
                  />
                  <select
                    value={unavailableTime}
                    onChange={(event) => {
                      setUnavailableTime(event.target.value);
                      setAvailabilityMessage('');
                    }}
                    disabled={!unavailableDate}
                    className="border rounded-md px-3 py-2 text-sm bg-white disabled:bg-gray-100"
                  >
                    <option value="">Select time</option>
                    {generateTimeSlots().map((time) => (
                      <option key={time} value={time}>
                        {formatTimeSlot(time)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleMarkUnavailable}
                    disabled={markingUnavailable || !unavailableDate || !unavailableTime}
                    className="rounded-md bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {markingUnavailable ? 'Saving...' : 'Mark Unavailable'}
                  </button>
                </div>
                {availabilityMessage && (
                  <p className="mt-3 text-sm text-purple-700">{availabilityMessage}</p>
                )}
              </div>

              <div className="border-t p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">Unavailable Time Slots</h3>
                    <p className="text-sm text-gray-500">Slots blocked by this staff member.</p>
                  </div>
                </div>

                {assignedSlotsLoading ? (
                  <div className="rounded-lg border bg-gray-50 p-6 text-center text-gray-600">
                    Loading unavailable slots...
                  </div>
                ) : assignedSlots.length === 0 ? (
                  <div className="rounded-lg border bg-gray-50 p-6 text-center text-gray-600">
                    No unavailable slots yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignedSlots.map((slot, index) => (
                      <div
                        key={`${slot.date}-${slot.time}-${index}`}
                        className="rounded-lg border bg-red-50 p-4 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-semibold text-red-800">{slot.date}</p>
                          <p className="text-sm text-red-700">{slot.time}</p>
                        </div>
                        <button
                          onClick={() => handleMakeAvailable(slot.date, slot.time)}
                          disabled={removingUnavailable}
                          className="rounded-md bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                          Available
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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