import { useState, useEffect } from 'react';
import { Scissors, User, Clock, Calendar, Plus, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useUser, UserButton, useAuth } from '@clerk/clerk-react';
import BookAppointmentModal from './BookAppointmentModal';
import AppointmentList from './AppointmentList';
import { getMyAppointments, createReview, getReviews, deleteAppointment } from '../services/api';
import { getAllUsers } from '../services/userService';

export default function CustomerDashboard() {
  const { currentUser, loading, services, staff } = useApp();
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [myAppointments, setMyAppointments] = useState([]);
  const [token, setToken] = useState(null);

  // Review states
  const [reviewServiceId, setReviewServiceId] = useState('');
  const [reviewStaffId, setReviewStaffId] = useState('');
  const [reviewStaffName, setReviewStaffName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsStats, setReviewsStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [staffMembers, setStaffMembers] = useState([]);
  const [customerName, setCustomerName] = useState('');

  const handleProfileClick = () => navigate('/profile');

  // Stats derived from actual customer appointments
  const upcomingCount = myAppointments.filter((apt) => {
    const status = (apt.status || apt.state || 'pending').toLowerCase();
    return status === 'confirmed' || status === 'pending';
  }).length;

  const completedCount = myAppointments.filter((apt) => {
    const status = (apt.status || apt.state || 'pending').toLowerCase();
    return status === 'completed';
  }).length;

  // Fetch token and customer appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = await getToken();
        const appointments = await getMyAppointments(token);
        setMyAppointments(appointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } 
    }
    const fetchStaffMembers = async () => {
      try {
        const usersData = await getAllUsers();
        const staff = usersData.data.filter(
          user => user.publicMetadata?.role === "staff"
        );
        console.log('Fetched staff members:', staff);
        setStaffMembers(staff);
      } catch (error) {
        console.error('Error fetching staff members:', error);
      }
    };
    fetchAppointments();
    fetchStaffMembers();
  }, []);

  // Fetch public reviews
  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const token = await getToken();
      const data = await getReviews(token);
      console.log('Fetched reviews data:', data.reviews);
      setReviewsList(data.reviews || []);
      setReviewsStats(data.stats || { averageRating: 0, totalReviews: 0 });
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [activeTab]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewServiceId) return alert('Please select a service');

    setSubmittingReview(true);
    try {
      const freshToken = await getToken();
      if (!freshToken) {
        alert('User not authenticated');
        setSubmittingReview(false);
        return;
      }

      await createReview(freshToken, {
        serviceId: reviewServiceId,
        staffId: reviewStaffId || undefined,
        staffName: reviewStaffName || undefined,
        rating: reviewRating,
        comment: reviewComment,
      });
      alert('Review submitted successfully!');
      setReviewServiceId('');
      setReviewStaffId('');
      setReviewRating(5);
      setReviewComment('');
      fetchReviews();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteAppointment = async (id) => {
    const confirmed = window.confirm('Are you sure you want to cancel this appointment?');
    if (!confirmed) {
      return;
    }

    try {
      const freshToken = await getToken();
      if (!freshToken) {
        alert('User not authenticated');
        return;
      }

      await deleteAppointment(freshToken, id);
      setMyAppointments((currentAppointments) =>
        currentAppointments.filter((appointment) => (appointment._id || appointment.id) !== id)
      );
      alert('Appointment cancelled successfully.');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert(error.message || 'Failed to cancel appointment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Aura</span>
          </div>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 flex gap-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'dashboard' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-purple-600'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'appointments' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-purple-600'}`}
          >
            My Appointments
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'reviews' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-purple-600'}`}
          >
            Reviews
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1 font-medium">Upcoming Appointments</p>
                    <p className="text-4xl font-bold">{upcomingCount}</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1 font-medium">Completed Visits</p>
                  <p className="text-4xl font-bold text-green-600">{completedCount}</p>
                </div>
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                  <Clock className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </div>

            {/* Book Appointment Section */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8 shadow-md relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Ready for a new look?</h2>
                  <p className="text-purple-100 max-w-md">Book your next beauty session now, choose your favorite stylist, and select multiple services.</p>
                </div>
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl shrink-0"
                >
                  <Plus className="w-5 h-5" />
                  Book Appointment
                </button>
              </div>
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/5 rounded-full -translate-x-12 translate-y-12"></div>
            </div>

            {/* Recent Appointments Preview */}
            {myAppointments.length > 0 ? (
              <div className="bg-white rounded-2xl p-6 border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Recent Appointments</h3>
                  <button onClick={() => setActiveTab('appointments')} className="text-purple-600 hover:text-purple-700 text-sm font-semibold flex items-center gap-1">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {myAppointments.slice(0, 3).map((apt) => {
                    const svcNames = apt.services?.map(s => s.serviceName).join(', ') || 'Service';
                    const aptDate = apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString() : 'Date TBD';
                    const status = (apt.status || apt.state || 'pending').toLowerCase();

                    return (
                      <div key={apt._id || apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl transition-all gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm sm:text-base">{svcNames}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{aptDate} at {apt.appointmentTime || 'Time TBD'}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                          {status === 'completed' && (
                            <button
                              onClick={() => {
                                if (apt.services?.[0]?.serviceId) {
                                  setReviewServiceId(apt.services[0].serviceId);
                                }
                                if (apt.staff?.staffId) {
                                  const matchingStaff = staff.find(s => s.name === apt.staff.staffName);
                                  if (matchingStaff) {
                                    setReviewStaffId(matchingStaff.id);
                                  }
                                }
                                setActiveTab('reviews');
                              }}
                              className="text-xs font-semibold text-purple-600 hover:underline"
                            >
                              Leave a Review
                            </button>
                          )}
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize shrink-0 ${status === 'confirmed' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                              status === 'completed' ? 'bg-green-50 text-green-700 border border-green-100' :
                                status === 'pending' ? 'bg-yellow-50 text-yellow-800 border border-yellow-100' :
                                  'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                            {status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border shadow-sm text-center text-gray-500">
                No recent appointments found. Book your first session to get started!
              </div>
            )}
          </>
        )}

        {activeTab === 'appointments' && (
          <AppointmentList appointments={myAppointments} userRole="customer" onDelete={handleDeleteAppointment} />
        )}

        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Submit Review Column */}
            <div className="lg:col-span-1 bg-white rounded-2xl p-6 border shadow-sm h-fit">
              <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                Review Your Visit
              </h3>

              <form onSubmit={handleReviewSubmit} className="space-y-5">
                {/* Select Service */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Select Service *</label>
                  <select
                    value={reviewServiceId}
                    onChange={(e) => setReviewServiceId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                    required
                  >
                    <option value="">-- Choose a Service --</option>
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.id}>{srv.name}</option>
                    ))}
                  </select>
                </div>

                {/* Select Staff */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Select Stylist</label>
                  <select
                    value={reviewStaffId}
                    onChange={(e) => {
                      const selectedId = e.target.value;

                      const selectedStaff = staffMembers.find(
                        (st) => st.id === selectedId
                      );

                      setReviewStaffId(selectedId);
                      setReviewStaffName(
                        selectedStaff ? `${selectedStaff.firstName} ${selectedStaff.lastName}` : ""
                      );
                    }}
                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                  >
                    <option value="">-- Choose a Stylist --</option>
                    {staffMembers.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.firstName} {st.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Stars */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Your Rating *</label>
                  <div className="flex gap-2 items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star className={`w-8 h-8 ${star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                    <span className="text-sm font-semibold text-gray-500 ml-2">({reviewRating}/5)</span>
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Comments</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe your styling experience, our salon service, cleanliness, etc..."
                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                    rows={4}
                    maxLength={500}
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {reviewComment.length}/500 characters
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingReview ? 'Submitting Review...' : 'Submit Review'}
                </button>
              </form>
            </div>

            {/* Reviews List & Overall Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Card */}
              <div className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-1">Customer Reviews</h4>
                  <p className="text-sm text-gray-500">Real feedback from clients of Aura Salon</p>
                </div>
                <div className="flex items-center gap-4 bg-purple-50 px-6 py-4 rounded-2xl shrink-0">
                  <div className="text-center">
                    <span className="text-3xl font-extrabold text-purple-700">
                      {reviewsStats.averageRating ? reviewsStats.averageRating.toFixed(1) : '0.0'}
                    </span>
                    <span className="text-purple-600 text-xl font-bold">/5</span>
                  </div>
                  <div className="border-l border-purple-200 h-10"></div>
                  <div>
                    <div className="flex text-amber-400 text-sm gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= Math.round(reviewsStats.averageRating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-purple-700 font-bold mt-1">{reviewsStats.totalReviews || 0} reviews total</p>
                  </div>
                </div>
              </div>

              {/* Feed of Reviews */}
              <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
                {loadingReviews ? (
                  <div className="text-center py-12 text-gray-500 font-medium">Loading reviews...</div>
                ) : reviewsList.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 border text-center text-gray-500 shadow-sm">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold">No reviews yet</p>
                    <p className="text-sm text-gray-400 mt-1">Be the first to share your experience!</p>
                  </div>
                ) : (
                  reviewsList.map((rev) => (
                    <div key={rev._id} className="bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">
                            {rev.customerName || 'Anonymous Client'}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="text-[11px] font-semibold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-full">
                              {rev.service?.name || 'Service'}
                            </span>
                            {rev.staffName && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 bg-pink-50 text-pink-700 border border-pink-100 rounded-full">
                                Stylist: {rev.staffName}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex text-amber-400 gap-0.5 justify-end">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${star <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-400 block mt-1">
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            }) : 'Date unknown'}
                          </span>
                        </div>
                      </div>
                      {rev.comment && (
                        <p className="text-gray-600 text-sm italic bg-gray-50 p-3 rounded-xl border border-gray-100 mt-2">
                          "{rev.comment}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
    </div>
  );
}
