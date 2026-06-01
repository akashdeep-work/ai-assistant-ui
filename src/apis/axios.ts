import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../utils/env';
import type { ApiErrorPayload } from '../types/chat.types';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getApiErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const axiosError = error as AxiosError<ApiErrorPayload>;
    const detail = axiosError.response?.data?.detail;

    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((item) => item.msg).filter(Boolean).join(', ');
    }

    if (typeof detail === 'string') return detail;
    if (axiosError.response?.data?.message) return axiosError.response.data.message;
    if (axiosError.message) return axiosError.message;
  }

  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
};