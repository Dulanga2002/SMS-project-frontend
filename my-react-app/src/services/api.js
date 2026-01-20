const API_URL =  'http://localhost:5000/api';

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

// Create appointment
export const createAppointment = async (token, appointmentData) => {
  try {
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData)
    });

    if (!response.ok) {
      throw new Error('Failed to create appointment');
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
    const response = await fetch(`${API_URL}/appointments/my-appointments`, {
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
    console.log('getMyAppointments response data:', data);
    return data;
  } catch (error) {
    console.error('Error getting appointments:', error);
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

export default {
  syncUser,
  getUserProfile,
  createAppointment,
  getMyAppointments,
  getServices,
  getStaff
};
