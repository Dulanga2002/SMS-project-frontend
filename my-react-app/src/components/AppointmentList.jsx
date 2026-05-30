import { Calendar, Clock, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function AppointmentList({ appointments = [], userRole }) {
  const formatDate = (value) => {
    if (!value) {
      return '—';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString();
  };

  const formatTime = (value) => {
    if (!value) {
      return '—';
    }
    if (typeof value === 'string') {
      return value;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '—';
    }
    return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusValue = (appointment) => {
    const rawStatus = appointment?.status || appointment?.state;
    if (typeof rawStatus === 'string' && rawStatus.trim()) {
      return rawStatus.toLowerCase();
    }
    return 'pending';
  };

  const getServicesTotal = (services) => {
    if (!Array.isArray(services)) {
      return 0;
    }
    return services.reduce((sum, service) => sum + (service?.serviceCost || 0), 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <AlertCircle className="w-4 h-4" />,
      confirmed: <CheckCircle className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
    };
    return icons[status] || icons.pending;
  };

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-lg p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Appointments</h3>
        <p className="text-gray-500">You don't have any appointments yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">
        {userRole === 'customer' ? 'My Appointments' : 'All Appointments'}
      </h2>
      <div className="space-y-4">
        {appointments.map((appointment, index) => {
          const status = getStatusValue(appointment);
          const services = Array.isArray(appointment?.services) ? appointment.services : [];
          const totalCost = appointment?.totalCost ?? getServicesTotal(services);

          return (
            <div
              key={appointment?._id || appointment?.id || `appointment-${index}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">Appointment</h3>
                  {userRole !== 'customer' && (
                    <p className="text-sm text-gray-600">
                      Customer: {appointment?.customer?.customerName || 'Unknown'}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Staff: {appointment?.staff?.staffName || 'Unassigned'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm font-medium">{formatDate(appointment?.appointmentDate)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="text-sm font-medium">{formatTime(appointment?.appointmentTime)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Total Cost</p>
                    <p className="text-sm font-medium">LKR {totalCost}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Services</p>
                  {services.length === 0 ? (
                    <p className="text-sm text-gray-600">—</p>
                  ) : (
                    <ul className="text-sm text-gray-700 space-y-1">
                      {services.map((service, serviceIndex) => (
                        <li key={service?._id || service?.serviceId || `${appointment?._id}-service-${serviceIndex}`}>
                          {service?.serviceName || 'Service'}
                          {typeof service?.serviceCost === 'number' ? ` - LKR ${service.serviceCost}` : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm text-gray-700">{appointment?.description || '—'}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Booked At</p>
                  <p className="text-sm text-gray-700">{formatDate(appointment?.createdAt)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
