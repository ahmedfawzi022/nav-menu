import axios, { AxiosError } from 'axios';
import { NavItem, DragAnalytics } from './types';
import { mockNavigation } from './mockData';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8081',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isUsingMockData = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleApiError = (error: unknown, fallbackValue?: any): any => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.code === 'ECONNREFUSED' || axiosError.message === 'Network Error') {
      isUsingMockData = true;
      console.log('Server not available. using mock data.');
      return fallbackValue;
    }
    if (axiosError.response) {
      throw new Error(`Server error: ${axiosError.response.status} - ${axiosError.response.statusText}`);
    }
  }
  throw error;
};

export const api = {
  getNavigation: async (): Promise<NavItem[]> => {
    try {
      if (isUsingMockData) {
        return mockNavigation;
      }
      const response = await axiosInstance.get<NavItem[]>('/nav');
      return response.data;
    } catch (error) {
      return handleApiError(error, mockNavigation);
    }
  },

  saveNavigation: async (navigation: NavItem[]): Promise<void> => {
    try {
      if (isUsingMockData) {
        // Simulate successful save in demo mode
        console.log('Saving navigation:', navigation);
        return;
      }
      await axiosInstance.post('/nav', navigation);
    } catch (error) {
      handleApiError(error);
    }
  },

  trackDragAndDrop: async (analytics: DragAnalytics): Promise<void> => {
    try {
      if (isUsingMockData) {
        console.log('Analytics:', analytics);
        return;
      }
      await axiosInstance.post('/track', analytics);
    } catch (error) {
      console.error('Analytics Error:', error);
    }
  }
};