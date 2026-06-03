import { useState, useEffect } from 'react';
import { Scissors, Calendar, Plus, DollarSign, Clock, X, ArrowRight, TrendingUp, BadgeCheck, AlertCircle, XCircle, Sparkles, CalendarDays, ReceiptText, Users } from 'lucide-react';
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
  const totalRevenue = appointments.reduce((sum, appointment) => {
    const directTotal = Number(appointment?.totalCost || appointment?.service?.price || 0);
    const serviceTotal = Array.isArray(appointment?.services)
      ? appointment.services.reduce((serviceSum, service) => serviceSum + Number(service?.serviceCost || 0), 0)
      : 0;

    return sum + (directTotal || serviceTotal);
  }, 0);

  const recentAppointments = [...appointments]
    .sort((left, right) => new Date(right.createdAt || right.appointmentDate || 0) - new Date(left.createdAt || left.appointmentDate || 0))
    .slice(0, 4);

  const overviewMetrics = [
    {
      label: 'Total Appointments',
      value: totalAppointments,
      icon: CalendarDays,
      gradient: 'from-purple-600 to-pink-600',
      text: 'Booked across all customers',
    },
    {
      label:'Pending Appointments',
      value: upcomingCount,
      icon: AlertCircle,
      gradient: 'from-amber-500 to-yellow-500',
      text: 'Upcoming visits ',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: BadgeCheck,
      gradient: 'from-emerald-600 to-teal-500',
      text: 'Successful finished visits',
    },
    {
      label: 'Revenue',
      value: `LKR ${totalRevenue.toLocaleString()}`,
      icon: ReceiptText,
      gradient: 'from-amber-500 to-orange-500',
      text: 'Approximate service income',
    },
  ];

  const statusSummary = [
   
    { label: 'Pending', value: upcomingCount - acceptedCount, color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertCircle },
   
    { label: 'Completed', value: completedCount, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: TrendingUp },
  ];

  const getStatusStyles = (status) => {
    const normalized = (status || 'pending').toLowerCase();
    const styles = {
      pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
      confirmed: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
      completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      cancelled: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    };

    return styles[normalized] || styles.pending;
  };

  const formatDisplayDate = (value) => {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDisplayTime = (value) => {
    if (!value) return '—';
    if (typeof value === 'string') return value;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  

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
          <div className="space-y-8">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.12),_transparent_30%)]" />
              <div className="relative grid gap-8 px-6 py-8 lg:grid-cols-[1.4fr_0.9fr] lg:px-8 lg:py-10">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
                    
                    Admin Overview
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-white/70">Welcome back</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight lg:text-4xl">
                      {currentUser?.name || 'Salon Admin'}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 lg:text-base">
                      Monitor appointments, track service performance, and keep the salon experience polished from a single dashboard.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-purple-700 shadow-lg transition-transform hover:-translate-y-0.5"
                    >
                      View appointments
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setActiveTab('services')}
                      className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/15"
                    >
                      Manage services
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/65">Total Appointments</p>
                    <p className="mt-2 text-3xl font-semibold">{totalAppointments}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/65">Revenue Snapshot</p>
                    <p className="mt-2 text-3xl font-semibold">LKR {totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {overviewMetrics.map((metric) => {
                const MetricIcon = metric.icon;
                return (
                  <article key={metric.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${metric.gradient} text-white shadow-lg`}>
                      <MetricIcon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-gray-500">{metric.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{metric.value}</p>
                    <p className="mt-2 text-sm text-gray-500">{metric.text}</p>
                  </article>
                );
              })}
            </section>

    

            <section className="grid gap-6 xl:grid-cols-[1.3fr_0.95fr]">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Latest Activity</p>
                    <h2 className="text-2xl font-semibold text-gray-900">Recent appointments</h2>
                  </div>
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                    {recentAppointments.length} latest
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {recentAppointments.length > 0 ? (
                    recentAppointments.map((appointment, index) => {
                      const status = (appointment?.status || 'pending').toLowerCase();
                      const totalCost = Number(appointment?.totalCost || appointment?.service?.price || 0) || 0;

                      return (
                        <div key={appointment?._id || appointment?.id || `recent-${index}`} className="rounded-2xl border border-gray-200 p-4 transition-shadow hover:shadow-md">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900">
                                  {appointment?.customer?.customerName || appointment?.customer?.name || 'Customer'}
                                </p>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyles(status)}`}>
                                  {status}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                {appointment?.service?.name || appointment?.services?.[0]?.serviceName || 'Service'}
                              </p>
                            </div>

                            <p className="text-sm font-semibold text-purple-600">LKR {totalCost.toLocaleString()}</p>
                          </div>

                          <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-purple-600" />
                              {formatDisplayDate(appointment?.appointmentDate || appointment?.date)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-purple-600" />
                              {formatDisplayTime(appointment?.appointmentTime || appointment?.startTime)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-purple-600" />
                              {appointment?.staff?.staffName || appointment?.staff?.name || 'Staff'}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                      <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                      <p className="mt-3 font-semibold text-gray-800">No appointments yet</p>
                      <p className="mt-1 text-sm text-gray-500">New bookings will appear here automatically.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Salon Inventory</p>
                    <h2 className="text-2xl font-semibold text-gray-900">Services at a glance</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('services')}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-purple-200 hover:text-purple-600"
                  >
                    Open services
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6 space-y-3">
                  {services && services.length > 0 ? services.slice(0, 4).map((service) => (
                    <div key={service.id} className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{service.name}</p>
                          <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                        </div>
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                          {service.duration}h
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="text-gray-500">Price</span>
                        <span className="font-semibold text-purple-700">LKR {service.price}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
                      No services available yet.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
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
