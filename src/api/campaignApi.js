import apiClient from './axios';

export const getAllCampaigns = async () => {
    try {
        const response = await apiClient.get('/campaign/getAll');
        return response.data;
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
    }
};

export const getSingleCampaign = async (id) => {
    try {
        const response = await apiClient.get(`/campaign/getsingle/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching campaign with id ${id}:`, error);
        throw error;
    }
};

export const createCampaign = async (data) => {
    try {
        const response = await apiClient.post('/campaign/create', data);
        return response.data;
    } catch (error) {
        console.error("Error creating campaign:", error);
        throw error;
    }
};

export const updateCampaign = async (id, data) => {
    try {
        const response = await apiClient.put(`/campaign/update/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error updating campaign with id ${id}:`, error);
        throw error;
    }
};

export const deleteCampaign = async (id) => {
    try {
        const response = await apiClient.delete(`/campaign/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting campaign with id ${id}:`, error);
        throw error;
    }
};
