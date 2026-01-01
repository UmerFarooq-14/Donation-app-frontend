import apiClient from './axios';

export const createDonation = async (data) => {
    try {
        const response = await apiClient.post('/donation/createDonation', data);
        return response.data;
    } catch (error) {
        console.error("Error creating donation:", error);
        throw error;
    }
};

export const getMyDonations = async () => {
    try {
        const response = await apiClient.get('/donation/getMyDonation');
        return response.data;
    } catch (error) {
        console.error("Error fetching user donations:", error);
        throw error;
    }
};

export const getAllDonationsAdmin = async (params) => {
    try {
        const response = await apiClient.get('/donation/admin', { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching all donations (admin):", error);
        throw error;
    }
};

export const updateDonationStatus = async (id, status) => {
    try {
        const response = await apiClient.put(`/donation/update/${id}`, { status });
        return response.data;
    } catch (error) {
        console.error("Error updating donation status:", error);
        throw error;
    }
};
