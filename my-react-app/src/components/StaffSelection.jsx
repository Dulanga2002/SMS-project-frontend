import { useState } from 'react';
import { User, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TimeSlotSelection from './TimeSlotSelection';

export default function StaffSelection({ users, service, onBack }) {
  const { staff } = useApp();
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Filter staff that can perform this service
  const availableStaff = staff.filter(s => s.services.includes(service.id));

  if (selectedStaff) {
    console.log('Selected Staff:', selectedStaff);
    return (
      <TimeSlotSelection
        service={service}
        staff={selectedStaff}
        onBack={() => setSelectedStaff(null)}
      />
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Services
      </button>

      <div className="bg-purple-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600 mb-1">Selected Service</p>
        <h3 className="text-xl text-purple-600">{service.name}</h3>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <span>Rs.{service.price}</span>
          <span>•</span>
          <span>{service.duration} hour{service.duration > 1 ? 's' : ''}</span>
        </div>
      </div>

      <h2 className="text-2xl mb-6">Select Staff Member</h2>

      {users.length === 0 ? (
    <div className="bg-white rounded-lg p-8 text-center border">
        <p className="text-gray-600">
        No staff members available for this service at the moment.
        </p>
    </div>
    ) : (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {users.map((staffMember) => (
        <div
            key={staffMember.userId}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-purple-600 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setSelectedStaff(staffMember)}
        >
            <div className="p-6">
            {/* Avatar */}
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                {staffMember.imageUrl ? (
                <img
                    src={staffMember.imageUrl}
                    alt={`${staffMember.firstName} ${staffMember.lastName}`}
                    className="w-full h-full object-cover"
                />
                ) : (
                <User className="w-8 h-8 text-purple-600" />
                )}
            </div>

            {/* Name */}
            <h3 className="text-center text-lg mb-2">
                {staffMember.firstName} {staffMember.lastName}
            </h3>

            {/* Role label */}
            <p className="text-center text-sm text-gray-600 mb-4">
                Staff Member
            </p>

            <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                Select
                <ArrowRight className="w-4 h-4" />
            </button>
            </div>
        </div>
        ))}
    </div>
    )}

    </div>
  );
}
