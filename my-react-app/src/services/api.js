// API Service integration with backend
const API_URL = 'http://localhost:5000/api';

// Sync user with backend
export const syncUser = async (token) => {
  try {
    const response = await fetch(`${API_URL}/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('syncUser response status:', response);
    if (!response.ok) {
      throw new Error('Failed to sync user');
    }

    const data = await response.json();
    console.log('syncUser response data:', data);
    return data;
  } catch (error) {
    console.error('Error syncing user:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (token) => {
  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }

    const data = await response.json();
    console.log('getUserProfile response data:', data);
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Create appointment (matches backend /api/newAppointment)
export const createAppointment = async (token, appointmentData) => {
  try {
    console.log("Appointment data being sent:", appointmentData);
    const response = await fetch(`${API_URL}/newAppointment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create appointment');
    }

    const data = await response.json();
    console.log('createAppointment response data:', data);
    return data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

// Get user's appointments
export const getMyAppointments = async (token) => {
  try {
    const response = await fetch(`${API_URL}/newAppointment/my-appointments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get appointments');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting appointments:', error);
    throw error;
  }
};

// Get staff member appointments
export const getStaffAppointments = async (token) => {
  try {
    const response = await fetch(`${API_URL}/newAppointment/staff-appointments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get staff appointments');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting staff appointments:', error);
    throw error;
  }
};

// Get all appointments (for admin)
export const getAllAppointments = async () => {
  try {
    const response = await fetch(`${API_URL}/newAppointment/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get all appointments');
    }

    const data = await response.json();
    console.log('getAllAppointments response data:', data);

    // Extract appointments array from response
    // Response format: { message: "...", appointments: [...], count: ... }
    const appointments = data.appointments || [];
    return appointments;
  } catch (error) {
    console.error('Error getting all appointments:', error);
    throw error;
  }
};

// Delete appointment (for admin)
export const deleteAppointment = async (token, id) => {
  try {
    const response = await fetch(`${API_URL}/newAppointment/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete appointment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

// Get assigned slots for a staff member (optionally by date)
export const getAssignedSlots = async (token, staffUserId, date) => {
  try {
    let url = `${API_URL}/newAppointment/assigned-slots`;
    const params = new URLSearchParams();
    if (staffUserId) params.append('staffUserId', staffUserId);
    if (date) params.append('date', date);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get assigned slots');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting assigned slots:', error);
    throw error;
  }
};

// Mark a staff slot as unavailable
export const markStaffSlotUnavailable = async (token, appointmentData) => {
  try {
    const response = await fetch(`${API_URL}/newAppointment/mark-unavailable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to mark slot unavailable');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking staff slot unavailable:', error);
    throw error;
  }
};

// Remove a staff unavailable slot
export const removeStaffSlotUnavailable = async (token, appointmentData) => {
  try {
    const response = await fetch(`${API_URL}/newAppointment/remove-unavailable`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove unavailable slot');
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing staff slot unavailable:', error);
    throw error;
  }
};

// Get all services
export const getServices = async () => {
  try {
    const response = await fetch(`${API_URL}/services`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get services');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting services:', error);
    throw error;
  }
};

// Get all staff members
export const getStaff = async () => {
  try {
    const response = await fetch(`${API_URL}/users/staff`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get staff');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting staff:', error);
    throw error;
  }
};

// Create service
export const createService = async (serviceData) => {
  try {
    console.log('Creating service with data:', serviceData);
    const response = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(serviceData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create service');
    }

    const data = await response.json();
    console.log('Service created:', data);
    return data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

// Delete service (admin)
export const deleteService = async (token, id) => {
  try {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete service');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

export const getReviews = async (token, serviceId, staffId, page, limit) => {
  try {
    const params = new URLSearchParams();
    if (serviceId) params.append('serviceId', serviceId);
    if (staffId) params.append('staffId', staffId);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    const url = `${API_URL}/reviews${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    });
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return await response.json();
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export const createReview = async (token, reviewData) => {
  try {
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });
    if (!response.ok) {
      let errorMessage = 'Failed to create review';
      try {
        const err = await response.json();
        errorMessage = err.message || errorMessage;
      } catch (jsonErr) {
        try {
          const text = await response.text();
          errorMessage = text || errorMessage;
        } catch (textErr) {}
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export default {
  syncUser,
  getUserProfile,
  createAppointment,
  getMyAppointments,
  getAssignedSlots,
  getStaffAppointments,
  getAllAppointments,
  deleteAppointment,
  getServices,
  getStaff,
  createService,
  deleteService,
  // Get reviews (public)
  getReviews,
  // Create a review (authenticated)
  createReview
};
