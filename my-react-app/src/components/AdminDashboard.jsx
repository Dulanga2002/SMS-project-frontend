import { useState, useEffect } from 'react';
import { Scissors, Calendar, Plus, DollarSign, Clock, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import AppointmentList from './AppointmentList';
import api from '../services/api';
import { useAuth, UserButton } from '@clerk/clerk-react';

export default function AdminDashboard() {
  const { currentUser, logout, services } = useApp();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // fetch all appointments
    const fetchAppointments = async () => {
      try {
        const appointmentsData = await api.getAllAppointments();
        console.log('Fetched appointments:', appointmentsData);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    }
    fetchAppointments();
  }, [])

  // staff management removed
  // Service form state
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAppointment = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment? This action will notify the staff and customer.')) {
      try {
        const token = await getToken();
        await api.deleteAppointment(token, id);
        alert('Appointment deleted successfully!');
        // Remove from local state
        setAppointments(prev => prev.filter(apt => (apt._id || apt.id) !== id));
      } catch (error) {
        alert('Failed to delete appointment: ' + (error.message || 'Please try again'));
        console.error('Delete appointment error:', error);
      }
    }
  };

  // Calculate statistics
  const totalAppointments = appointments.length;
  const acceptedCount = appointments.filter(apt => apt.status === 'confirmed').length;
  const rejectedCount = appointments.filter(apt => apt.status === 'rejected').length;
  const completedCount = appointments.filter(apt => apt.status === 'completed').length;
  const upcomingCount = appointments.filter(apt => apt.status === 'pending' || apt.status === 'confirmed').length;
  

  const handleAddService = async (e) => {
    e.preventDefault();

    // Validate form
    if (!serviceForm.name || !serviceForm.description || !serviceForm.price || !serviceForm.duration) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await api.createService({
        name: serviceForm.name,
        description: serviceForm.description,
        price: parseFloat(serviceForm.price),
        duration: parseInt(serviceForm.duration),
      });

      alert('Service created successfully!');
      setServiceForm({
        name: '',
        description: '',
        price: '',
        duration: '',
      });
      setShowAddServiceForm(false);

      // Refresh page to see new service
      window.location.reload();
    } catch (error) {
      alert('Failed to create service: ' + (error.message || 'Please try again'));
      console.error('Service creation error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="w-8 h-8 text-purple-600" />
              <span className="text-2xl text-purple-600">Aura</span>
              <span className="text-sm text-gray-600">Admin Panel</span>
            </div>

            <div className="flex items-center gap-4">
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 border-b-2 transition-colors ${activeTab === 'overview'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-purple-600'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 border-b-2 transition-colors ${activeTab === 'appointments'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-purple-600'
                }`}
            >
              Appointments
            </button>
            
            <button
              onClick={() => setActiveTab('services')}
              className={`py-4 border-b-2 transition-colors ${activeTab === 'services'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-purple-600'
                }`}
            >
              Services
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Total Appointments</p>
                    <p className="text-4xl">{totalAppointments}</p>
                  </div>
                  <Calendar className="w-12 h-12 opacity-80" />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'appointments' && (
          <div>
            <AppointmentList appointments={appointments} userRole="admin" onDelete={handleDeleteAppointment} />
          </div>
        )}

        

        {activeTab === 'services' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl">Services Management</h2>
              <button
                onClick={() => {
                  setServiceForm({
                    name: '',
                    description: '',
                    price: '',
                    duration: '',
                  });
                  setShowAddServiceForm(!showAddServiceForm);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Service
              </button>
            </div>

            {/* Add Service Form */}
            {showAddServiceForm && (
              <div className="bg-white rounded-lg p-6 border mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg">Add New Service</h3>
                  <button
                    onClick={() => setShowAddServiceForm(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Service Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                      placeholder="e.g., Hair Cut"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Price (Rs.) <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-2">
                      Description <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      placeholder="Enter service description"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      rows="3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Duration (hour) <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={serviceForm.duration}
                        onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                        placeholder="30"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Create Service
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddServiceForm(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Services List */}
            <div className="bg-white rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {services && services.length > 0 ? (
                  services.map((service) => (
                    <div
                      key={service.id}
                      className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                      <h4 className="font-semibold text-lg mb-2">{service.name}</h4>
                      <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-semibold text-purple-600">Rs. {service.price}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-semibold">{service.duration} hour</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-600">
                    No services available. Create your first service!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scissors className="w-6 h-6" />
                <span className="text-xl">Aura</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your perfect salon<br />
                management partner
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="">Hair Cut</li>
                <li className="">Hair Color</li>
                <li className="">Hair Straightening</li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
                  </li>
                  <li>
                    <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
                  </li>
                  <li>
                    <Link to="/careers" className="hover:text-white transition-colors">Careers</Link>
                  </li>
                </ul>
            </div>

            {/* Hours */}
            <div>
              <h4 className="text-lg mb-4">Hours</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Mon-Sat: 8:00 AM - 5:00 PM<br />
                Sun: Closed
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2026 Aura Salon Management System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
