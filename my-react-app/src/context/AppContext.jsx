import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { syncUser, createAppointment, getMyAppointments, getAllAppointments, getServices, getStaff } from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const { isSignedIn, getToken } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);

  // Fetch services and staff on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, staffData] = await Promise.all([
          getServices(),
          getStaff()
        ]);
        
        // Transform services to match frontend format
        const transformedServices = servicesData.map(service => ({
          id: service._id,
          name: service.name,
          description: service.description,
          price: service.price,
          duration: Math.floor(service.duration / 60), // Convert minutes to hours
          color: service.category === 'Hair' ? 
            (service.name.includes('Color') ? 'pink' : 
             service.name.includes('Straightening') ? 'blue' : 'purple') : 'purple'
        }));

        // Transform staff to match frontend format
        const transformedStaff = staffData.map(staffMember => ({
          id: staffMember._id,
          name: staffMember.name,
          services: servicesData.map(s => s._id), // All staff can do all services for now
          unavailableDates: []
        }));

        setServices(transformedServices);
        setStaff(transformedStaff);
      } catch (error) {
        console.error('Error fetching services/staff:', error);
      }
    };

    fetchData();
  }, []);

  // Sync user with backend when they sign in
  useEffect(() => {
    const syncUserData = async () => {
      if (isSignedIn) {
        try {
          setLoading(true);
          const token = await getToken();
          const userData = await syncUser(token);
          setCurrentUser(userData);
          console.log('User synced successfully:', userData);
          
          // Fetch all appointments for admin dashboard
          const allAppointments = await getAllAppointments();
          // Ensure appointments is always an array
          setAppointments(Array.isArray(allAppointments) ? allAppointments : []);
          console.log('All appointments loaded:', allAppointments);
        } catch (error) {
          console.error('Failed to sync user:', error);
          setAppointments([]); // Set empty array on error
        } finally {
          setLoading(false);
        }
      } else {
        setCurrentUser(null);
        setAppointments([]);
      }
    };

    syncUserData();
  }, [isSignedIn, getToken]);

  // Sample beauty tips data
  const beautyTips = [
    {
      id: 1,
      title: 'Perfect Haircut Tips',
      category: 'Styling',
      duration: '5:30',
      url: 'https://www.youtube.com/watch?v=3f2shMmVYbY',
      thumbnail: 'https://img.youtube.com/vi/3f2shMmVYbY/hqdefault.jpg'
    },
    {
      id: 2,
      title: 'Healthy Hair Tips',
      category: 'Hair Care',
      duration: '7:45',
      url: 'https://www.youtube.com/watch?v=QsynaMuQhZg',
      thumbnail: 'https://img.youtube.com/vi/QsynaMuQhZg/hqdefault.jpg'
    },
    {
      id: 3,
      title: 'How To Fix Frizzy Hair LIKE A PRO',
      category: 'Maintenance',
      duration: '4:20',
      url: 'https://www.youtube.com/watch?v=ePcEb2fymu0',
      thumbnail: 'https://img.youtube.com/vi/ePcEb2fymu0/hqdefault.jpg'
    },
    {
      id: 4,
      title: 'How to Style Your Hair like a Pro',
      category: 'Proffesional',
      duration: '6:15',
      url: 'https://www.youtube.com/watch?v=ZM3n0OSrK9g',
      thumbnail: 'https://img.youtube.com/vi/ZM3n0OSrK9g/hqdefault.jpg'
    }
  ];

  // Book appointment
  const bookAppointment = async (appointmentData) => {
    try {
      const token = await getToken();
      console.log('Booking appointment with data:', appointmentData);
      const response = await createAppointment(token, appointmentData);
      console.log('Appointment created:', response);

      // Add the new appointment to state
      if (response.success && response.appointment) {
        setAppointments([...appointments, response.appointment]);
      }

      return response;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  };

  const value = {
    services,
    staff,
    beautyTips,
    appointments,
    bookAppointment,
    currentUser,
    loading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
