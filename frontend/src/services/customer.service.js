// src/services/customer.service.js
import axios from "axios";
import { API_BASE_URL } from "../constants";

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

/**
 * Fetch customers with pagination and search
 * @param {Object} params { page, limit, search }
 */
export const getCustomers = (params = {}) =>
  axios.get(`${API_BASE_URL}/customer`, {
    ...authHeader(),
    params: {
      page: params.page || 1,
      limit: params.limit || 20,
      search: params.search || "",
    },
  });

export const addCustomer = (data) =>
  axios.post(`${API_BASE_URL}/customer`, data, authHeader());

export const updateCustomer = (id, data) =>
  axios.patch(`${API_BASE_URL}/customer/${id}`, data, authHeader());

export const deleteCustomer = (id) =>
  axios.delete(`${API_BASE_URL}/customer/${id}`, authHeader());

export const getCustomerVouchers = (id, params = {}) =>
  axios.get(`${API_BASE_URL}/customer/${id}/vouchers`, {
    ...authHeader(),
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || "",
    },
  });
