import { Calendar, Clock, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function AppointmentList({ appointments, userRole }) {
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
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {appointment.serviceName}
                </h3>
                {userRole !== 'customer' && (
                  <p className="text-sm text-gray-600">Customer: {appointment.customerName}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(appointment.status)}`}>
                {getStatusIcon(appointment.status)}
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm font-medium">{appointment.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="text-sm font-medium">{appointment.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="text-sm font-medium">LKR {appointment.price}</p>
                </div>
              </div>
            </div>

            {appointment.duration && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Duration: <span className="font-medium">{appointment.duration}</span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
