
import axios from 'axios';

const API_URL = 'http://localhost:7000'; 

export const fetchTransactions = (month) => {
    return axios.get(`${API_URL}/transactions`, { params: { month } });
};

export const fetchStatistics = (month) => {
    return axios.get(`${API_URL}/statistics`, { params: { month } });
};

export const fetchBarChart = (month) => {
    return axios.get(`${API_URL}/bar-chart`, { params: { month } });
};

export const fetchPieChart = (month) => {
    return axios.get(`${API_URL}/pie-chart`, { params: { month } });
};

export const fetchCombinedData = (month) => {
    return axios.get(`${API_URL}/combined-data`, { params: { month } });
};
