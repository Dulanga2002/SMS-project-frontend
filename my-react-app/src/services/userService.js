const API_URL =  'http://localhost:5000/api';

const getAllUsers = async () => {
    try {
        const response = await fetch(`${API_URL}/users/getClerkUsers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export {
    getAllUsers
}