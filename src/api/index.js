import apiClient from "./axios";
import { toast } from "react-toastify";

const handleError = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong";
  toast.error(message);
  throw error;
};

const getReq = async (path) => {
  try {
    const response = await apiClient.get(path);
    return response;
  } catch (error) {
    handleError(error);
  }
};

const postReq = async (path, data) => {
  try {
    const response = await apiClient.post(path, data);
    return response;
  } catch (error) {
    handleError(error);
  }
};

const deleteReq = async (path) => {
  try {
    const response = await apiClient.delete(path);
    return response;
  } catch (error) {
    handleError(error);
  }
};

const putReq = async (path, data) => {
  try {
    const response = await apiClient.put(path, data);
    return response;
  } catch (error) {
    handleError(error);
  }
};

export { getReq, postReq, putReq, deleteReq };