const API_URL =  'http://localhost:5000/api';

const getAppointmentByDetails = async (customerId, staffId, serviceId) => {
    try {
        const response = await fetch(`${API_URL}/appointments/getAllAppointments?customerId=${customerId}&staffId=${staffId}&serviceId=${serviceId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching appointment by details:', error);
        throw error;
    }
}

export {
    getAppointmentByDetails
}