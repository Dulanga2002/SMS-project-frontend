import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, DollarSign, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useUser, useAuth } from '@clerk/clerk-react';
import { getServices } from '../services/api';
import { getAllUsers } from '../services/userService';

export default function BookAppointmentModal({ isOpen, onClose }) {
  const { bookAppointment } = useApp();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [step, setStep] = useState(1); // 1: Services, 2: Staff, 3: Date/Time, 4: Confirmation

  // Data
  const [services, setServices] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);

  // Selections
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [description, setDescription] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch services and staff on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, usersData] = await Promise.all([
          getServices(),
          getAllUsers()
        ]);
        setServices(servicesData);
        // Filter only staff members
        console.log('Fetched users:', usersData);
        const staff = usersData.data.filter(
          user => user.publicMetadata?.role === "staff"
        );
        setStaffMembers(staff);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedServices([]);
      setSelectedStaff(null);
      setSelectedDate('');
      setSelectedTime('');
      setDescription('');
      setShowSuccess(false);
    }
  }, [isOpen]);

  // Service selection handlers
  const toggleService = (service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s._id === service._id);
      if (exists) {
        return prev.filter(s => s._id !== service._id);
      } else {
        return [...prev, service];
      }
    });
  };

  const isServiceSelected = (serviceId) => {
    return selectedServices.some(s => s._id === serviceId);
  };

  // Calculate total cost and duration
  const totalCost = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  // Generate next 14 days for date selection
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
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
      if (hour === 12) continue; // Lunch break
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const dates = generateDates();
  const timeSlots = generateTimeSlots();

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

  const formatTimeSlot = (time) => {
    const hour = parseInt(time.split(':')[0]);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  // Navigation handlers
  const goToNextStep = () => {
    if (step === 1 && selectedServices.length === 0) {
      alert('Please select at least one service');
      return;
    }
    if (step === 2 && !selectedStaff) {
      alert('Please select a staff member');
      return;
    }
    if (step === 3 && (!selectedDate || !selectedTime)) {
      alert('Please select date and time');
      return;
    }
    setStep(step + 1);
  };

  const goToPreviousStep = () => {
    setStep(step - 1);
  };

  // Submit booking
  const handleConfirmBooking = async () => {
    try {
      setLoading(true);

      const appointmentData = {
        customer: {
          customerId: user.id,
          customerName: user.fullName || user.firstName || 'Customer'
        },
        staff: {
          staffId: selectedStaff.userId,
          staffName: `${selectedStaff.firstName} ${selectedStaff.lastName}`
        },
        services: selectedServices.map(service => ({
          serviceId: service._id,
          serviceName: service.name,
          serviceCost: service.price
        })),
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        description: description
      };

      await bookAppointment(appointmentData);
      setShowSuccess(true);

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    } catch (error) {
      alert('Failed to book appointment: ' + (error.message || 'Please try again'));
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Success screen
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600">Your appointment has been booked successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Book Appointment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 border-b">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-16 h-1 ${step > s ? 'bg-purple-600' : 'bg-gray-300'}`} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Select Services */}
          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Select Services</h3>
              <p className="text-gray-600 mb-6">Choose one or more services for your appointment</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service._id}
                    onClick={() => toggleService(service)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      isServiceSelected(service._id)
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">{service.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-700">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {service.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Rs. {service.price}
                          </span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isServiceSelected(service._id)
                          ? 'border-purple-600 bg-purple-600'
                          : 'border-gray-300'
                      }`}>
                        {isServiceSelected(service._id) && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedServices.length > 0 && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Selected: {selectedServices.length} service(s)</p>
                      <p className="text-lg font-semibold text-purple-600">
                        Total: Rs. {totalCost} • {totalDuration} min
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Staff */}
          {step === 2 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Select Staff Member</h3>
              <p className="text-gray-600 mb-6">Choose a staff member for your appointment</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {staffMembers.map((staff) => (
                  <div
                    key={staff.id}
                    onClick={() => setSelectedStaff(staff)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedStaff?.userId === staff.userId
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3 overflow-hidden">
                        {staff.imageUrl ? (
                          <img
                            src={staff.imageUrl}
                            alt={`${staff.firstName} ${staff.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-purple-600" />
                        )}
                      </div>
                      <h4 className="font-semibold">
                        {staff.firstName} {staff.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">Staff Member</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {step === 3 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Select Date & Time</h3>

              {/* Date Selection */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h4 className="font-medium">Choose a Date</h4>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {dates.map((date) => {
                    const formattedDate = formatDate(date);
                    const isSelected = selectedDate === formattedDate.full;
                    return (
                      <button
                        key={formattedDate.full}
                        onClick={() => setSelectedDate(formattedDate.full)}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50 text-purple-600'
                            : 'border-gray-200 hover:border-purple-300'
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

              {/* Time Selection */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <h4 className="font-medium">Choose a Time</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Working Hours: 8:00 AM - 5:00 PM (Lunch: 12:00 PM - 1:00 PM)
                </p>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {timeSlots.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        disabled={!selectedDate}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          !selectedDate
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

              {/* Notes */}
              <div>
                <label className="block font-medium mb-2">Additional Notes (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any special requests or notes..."
                  className="w-full border rounded-lg p-3 text-sm"
                  rows="3"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              {step > 1 && (
                <button
                  onClick={goToPreviousStep}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {step < 3 ? (
                <button
                  onClick={goToNextStep}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Booking...' : `Confirm Booking - Rs. ${totalCost}`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
