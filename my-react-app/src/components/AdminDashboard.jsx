import { useState, useEffect } from 'react';
import { Scissors, User, LogOut, Calendar, TrendingUp, UserPlus, Mail, Lock, Phone, MapPin, Edit, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import AppointmentList from './AppointmentList';
import { getAllUsers } from '../services/userService';

export default function AdminDashboard() {
  const { currentUser, logout, appointments, services, staff, addStaff, updateStaff, deleteStaff } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch users from backend API
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
        console.log('Fetched users:', usersData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }
    fetchUsers();
  }, [])
  
  // Staff form state
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    contactNumber: '',
    address: '',
    specialty: '',
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Calculate statistics
  const totalAppointments = appointments.length;
  const acceptedCount = appointments.filter(apt => apt.status === 'confirmed').length;
  const rejectedCount = appointments.filter(apt => apt.status === 'rejected').length;
  const completedCount = appointments.filter(apt => apt.status === 'completed').length;
  const upcomingCount = appointments.filter(apt => apt.status === 'pending' || apt.status === 'confirmed').length;

  const handleAddStaff = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!staffForm.name || !staffForm.email || !staffForm.password || !staffForm.contactNumber) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingStaff) {
      // Update existing staff
      updateStaff(editingStaff.id, {
        name: staffForm.name,
        email: staffForm.email,
        contactNumber: staffForm.contactNumber,
        address: staffForm.address,
        specialty: staffForm.specialty,
      });
      alert('Staff member updated successfully!');
    } else {
      // Add new staff member
      addStaff({
        name: staffForm.name,
        email: staffForm.email,
        password: staffForm.password,
        contactNumber: staffForm.contactNumber,
        address: staffForm.address,
        specialty: staffForm.specialty,
        rating: 0,
      });
      alert('Staff member added successfully!');
    }

    // Reset form
    setStaffForm({
      name: '',
      email: '',
      password: '',
      contactNumber: '',
      address: '',
      specialty: '',
    });
    setShowAddStaffForm(false);
    setEditingStaff(null);
  };

  const handleEditStaff = (member) => {
    setEditingStaff(member);
    setStaffForm({
      name: member.name,
      email: member.email,
      password: '', // Don't show password
      contactNumber: member.contactNumber,
      address: member.address || '',
      specialty: member.specialty || '',
    });
    setShowAddStaffForm(true);
  };

  const handleDeleteStaff = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      deleteStaff(id);
      alert('Staff member deleted successfully!');
    }
  };

  const handleCancelForm = () => {
    setShowAddStaffForm(false);
    setEditingStaff(null);
    setStaffForm({
      name: '',
      email: '',
      password: '',
      contactNumber: '',
      address: '',
      specialty: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
                <button
                  onClick={() => navigate('/admin-profile')}
                  className="text-left hover:text-purple-600 transition-colors"
                >
                  <p className="text-sm">{currentUser?.name}</p>
                  <p className="text-xs text-gray-600">Administrator</p>
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
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
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-purple-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'appointments'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-purple-600'
              }`}
            >
              Appointments
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'staff'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-purple-600'
              }`}
            >
              Staff Management
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
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

              <div className="bg-white rounded-lg p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Accepted</p>
                    <p className="text-4xl text-green-600">{acceptedCount}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                    <p className="text-4xl text-blue-600">{upcomingCount}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 border">
                <h3 className="text-lg mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="text-green-600">{completedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rejected</span>
                    <span className="text-red-600">{rejectedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Staff</span>
                    <span className="text-purple-600">{staff.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Services</span>
                    <span className="text-purple-600">{services.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border col-span-2">
                <h3 className="text-lg mb-4">Recent Appointments</h3>
                <div className="space-y-2">
                  {appointments.slice(0, 5).map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm">{apt.customerName}</p>
                        <p className="text-xs text-gray-600">{apt.serviceName}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'appointments' && (
          <div>
            <h2 className="text-2xl mb-6">All Appointments</h2>
            <AppointmentList appointments={appointments} userRole="admin" />
          </div>
        )}

        {activeTab === 'staff' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl">Staff Management</h2>
              <button
                onClick={() => {
                  setEditingStaff(null);
                  setStaffForm({
                    name: '',
                    email: '',
                    password: '',
                    contactNumber: '',
                    address: '',
                    specialty: '',
                  });
                  setShowAddStaffForm(!showAddStaffForm);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Add Staff Member
              </button>
            </div>

            {/* Add/Edit Staff Form */}
            {showAddStaffForm && (
              <div className="bg-white rounded-lg p-6 border mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg">
                    {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                  </h3>
                  <button
                    onClick={handleCancelForm}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Full Name <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={staffForm.name}
                        onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                        placeholder="Enter full name"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={staffForm.email}
                        onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                        placeholder="Enter email"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        required
                        disabled={editingStaff !== null}
                      />
                    </div>
                  </div>

                  {!editingStaff && (
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Password <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={staffForm.password}
                          onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                          placeholder="Create password"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Contact Number <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={staffForm.contactNumber}
                        onChange={(e) => setStaffForm({ ...staffForm, contactNumber: e.target.value })}
                        placeholder="076"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={staffForm.address}
                        onChange={(e) => setStaffForm({ ...staffForm, address: e.target.value })}
                        placeholder="Enter address"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Specialty
                    </label>
                    <div className="relative">
                      <Scissors className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={staffForm.specialty}
                        onChange={(e) => setStaffForm({ ...staffForm, specialty: e.target.value })}
                        placeholder="e.g., Hair Stylist"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Staff List */}
            <div className="bg-white rounded-lg border">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="px-6 py-4 text-left text-sm text-gray-600">Name</th>
          <th className="px-6 py-4 text-left text-sm text-gray-600">Email</th>
          <th className="px-6 py-4 text-left text-sm text-gray-600">Contact</th>
          <th className="px-6 py-4 text-left text-sm text-gray-600">Address</th>
          <th className="px-6 py-4 text-left text-sm text-gray-600">Specialty</th>
          <th className="px-6 py-4 text-left text-sm text-gray-600">Appointments</th>
          <th className="px-6 py-4 text-left text-sm text-gray-600">Actions</th>
        </tr>
      </thead>

      <tbody className="divide-y">
        {users.map((member) => {
          const staffAppointments =
            appointments?.filter(
              (apt) => apt.staffId === member.userId
            ) || [];

          return (
            <tr key={member.userId} className="hover:bg-gray-50">
              {/* Name */}
              <td className="px-6 py-4">
                <p className="font-medium">
                  {member.firstName || ''} {member.lastName || ''}
                </p>
              </td>

              {/* Email */}
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600">
                  {member.email || '-'}
                </p>
              </td>

              {/* Contact */}
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600">-</p>
              </td>

              {/* Address */}
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600">-</p>
              </td>

              {/* Specialty */}
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600">-</p>
              </td>

              {/* Appointments */}
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {staffAppointments.length}
                </span>
              </td>

              {/* Actions */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditStaff(member)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit staff member"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      handleDeleteStaff(
                        member.userId,
                        `${member.firstName} ${member.lastName}`
                      )
                    }
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete staff member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>

            
          </div>
        )}
      </div>
    </div>
  );
}
