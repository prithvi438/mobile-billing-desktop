// src/services/inventory.service.js
import axios from "axios";
// import { getToken } from "./auth.service"; // utility to get access token
import { API_BASE_URL } from "../constants.js";

const BASE_URL = API_BASE_URL

/**
 * Fetch inventory items with optional filters
 * @param {Object} params { page, limit, search, category, barcode }
 */

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
});

export const getInventoryItems = async (params = {}) => {
  const token = await getToken();
  const query = new URLSearchParams({
    page: params.page || 1,
    limit: params.limit || 20,
    search: params.search || "",
    category: params.category || "",
    barcode: params.barcode || "",
  }).toString();

  return axios.get(`${BASE_URL}/inventory?${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

/**
 * Add a new inventory item
 * @param {Object} data
 */
export const addInventoryItem = async (data) => {
  const token = await getToken();
  return axios.post(`${BASE_URL}/inventory`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

/**
 * Update an existing inventory item
 * @param {string} id
 * @param {Object} data
 */
export const updateInventoryItem = async (id, data) => {
  const token = await getToken();
  return axios.patch(`${BASE_URL}/inventory/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

/**
 * Delete an inventory item
 * @param {string} id
 */
export const deleteInventoryItem = async (id) => {
  const token = await getToken();
  return axios.delete(`${BASE_URL}/inventory/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

/**
 * Fetch all categories (for filters or dropdowns)
 */
export const getInventoryCategories = async () => {
  const token = await getToken();
  return axios.get(`${BASE_URL}/category?page=1&limit=50`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};
