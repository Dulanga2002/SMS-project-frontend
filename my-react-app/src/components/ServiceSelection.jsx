import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUser } from '@clerk/clerk-react';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import StaffSelection from './StaffSelection';
import { getServices } from '../services/api';
import { getAllUsers } from '../services/userService';

export default function ServiceSelection() {
  const { services } = useApp();
  const { user } = useUser();
  const [selectedService, setSelectedService] = useState(null);
  const [fetchedServices, setFetchedServices] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);

  useEffect(() => {
    const allServices = async () => {
      try {
        const servicesData = await getServices();
        console.log('Fetched services:', servicesData);
        setFetchedServices(servicesData);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    }
    // now retrive all users (but want to filter only staff role)
    const users = async () => {
      try {
        const allUsers = await getAllUsers();
        // want to impliment a role filter
        setStaffMembers(allUsers)
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }
    users();
    allServices();
  }, [])

  const handleBookService = (service) => {
    if (!user) {
      alert('Please login to book a service');
      return;
    }
    setSelectedService(service);
  };

  if (selectedService) {
    return (
      <StaffSelection
        users={staffMembers}
        service={selectedService}
        onBack={() => setSelectedService(null)}
      />
    );
  }

  const getColorClasses = (color) => {
    const colorMap = {
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    };
    return colorMap[color] || colorMap.purple;
  };

  return (
    <div>
  <h2 className="text-2xl font-semibold mb-6">Book a Service</h2>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {fetchedServices.map((service) => (
      <div
        key={service._id}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
      >
        {/* Header */}
        <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <h3 className="text-2xl font-bold text-white">
            {service.name}
          </h3>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            {service.description}
          </p>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4" />
              <span>
                {service.duration / 60} hour{service.duration > 60 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>Rs. {service.price}</span>
            </div>
          </div>

          <button
            onClick={() => handleBookService(service)}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Book Now
          </button>
        </div>
      </div>
    ))}
  </div>
</div>

  );
}
