import { useState, useEffect } from 'react';
import { Calendar, Clock, Check, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useUser } from '@clerk/clerk-react';
import { getAppointmentByDetails } from '../services/appointmentService';

export default function TimeSlotSelection({ service, staff, onBack }) {
  const { bookAppointment, appointments } = useApp();
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [existingAppointments, setExistingAppointments] = useState([]);
  const customerId = "user_38QSJo4ihNJ9n5nNkkVwsd4qXJf";

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        console.log('Fetching appointments for:', {
          customerId,
          staffId: staff.userId,
          serviceId: service._id
        });
        const data = await getAppointmentByDetails(customerId, staff.userId, service._id);
        setExistingAppointments(data);
        console.log('Existing Appointments:', data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
    fetchAppointments();
  }, [user, staff, service]);

  // Generate next 7 days for date selection
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Generate time slots (8 AM to 5 PM, excluding 12-1 PM lunch)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 17; hour++) {
      if (hour === 12) continue;
      slots.push(`${hour}:00`);
    }
    return slots;
  };

  const dates = generateDates();
  const timeSlots = generateTimeSlots();

  const formatTimeSlot = (time) => {
    const hour = parseInt(time.split(':')[0]);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const isSlotAvailable = (date, time) => {
    if (staff.unavailableDates && staff.unavailableDates.includes(date)) return false;
    const formattedTime = formatTimeSlot(time);
    const existing = appointments.find(
      (apt) =>
        apt.staffId === staff.id &&
        apt.date === date &&
        apt.time === formattedTime &&
        (apt.status === 'pending' || apt.status === 'confirmed')
    );
    return !existing;
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    try {
      const appointmentData = {
        staffId: staff.id,
        serviceId: service.id,
        date: selectedDate,
        time: formatTimeSlot(selectedTime),
        price: service.price,
        duration: service.duration
      };

      await bookAppointment(appointmentData);
      setShowConfirmation(true);
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      alert('Failed to book appointment. Please try again.');
      console.error('Booking error:', error);
    }
  };

  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
      full: date.toISOString().split('T')[0]
    };
  };

  const parseDate = (dateStr) => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // --- Show Confirmation UI ---
  if (showConfirmation) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg p-8 text-center border shadow-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your appointment has been booked successfully.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- Main UI ---
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Staff Selection
      </button>

      <div className="bg-purple-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600 mb-1">Booking Summary</p>
        <h3 className="text-xl text-purple-600">{service.name}</h3>
        <p className="text-sm text-gray-600 mt-1">with {staff.name}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <span>Rs.{service.price}</span>
          <span>•</span>
          <span>{service.duration} hour{service.duration > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* --- Display Existing Appointments --- */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Existing Appointments</h2>
        {existingAppointments.length === 0 ? (
          <p className="text-gray-600">No appointments for this staff & service yet.</p>
        ) : (
          <ul className="space-y-3">
            {existingAppointments.map((apt) => (
              <li key={apt._id} className="p-3 border rounded-lg bg-gray-50">
                <p><strong>Date:</strong> {new Date(apt.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {apt.startTime} - {apt.endTime}</p>
                <p><strong>Status:</strong> {apt.status}</p>
                <p><strong>Notes:</strong> {apt.notes || '-'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- Date Selection --- */}
      <h2 className="text-2xl mb-6">Select Date & Time</h2>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-medium">Choose a Date</h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {dates.map((date) => {
            const formattedDate = formatDate(date);
            const isSelected = selectedDate === formattedDate.full;
            return (
              <button
                key={formattedDate.full}
                onClick={() => setSelectedDate(formattedDate.full)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isSelected ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-xs text-gray-500">{formattedDate.day}</div>
                <div className="text-lg font-medium">{formattedDate.date}</div>
                <div className="text-xs text-gray-500">{formattedDate.month}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Time Selection --- */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-medium">Choose a Time</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Working Hours: 8:00 AM - 5:00 PM (Lunch: 12:00 PM - 1:00 PM)
        </p>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {timeSlots.map((time) => {
            const available = selectedDate && isSlotAvailable(selectedDate, time);
            const isSelected = selectedTime === time;
            return (
              <button
                key={time}
                onClick={() => available && setSelectedTime(time)}
                disabled={!selectedDate || !available}
                className={`p-3 rounded-lg border-2 transition-all ${
                  !selectedDate || !available
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                    : isSelected
                    ? 'border-purple-600 bg-purple-50 text-purple-600'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                {formatTimeSlot(time)}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Booking Button --- */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-purple-600">Rs.{service.price}</p>
          </div>
          {selectedDate && selectedTime && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Selected Slot</p>
              <p className="font-medium">{parseDate(selectedDate)} at {formatTimeSlot(selectedTime)}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleBooking}
          disabled={!selectedDate || !selectedTime}
          className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
            selectedDate && selectedTime
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
