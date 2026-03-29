import axios from 'axios';
import { UpperArticle, CreateUpperArticleDto, UpdateUpperArticleDto } from '../types/UpperArticle';
import { getBackendBaseUrl } from '@/lib/backend-url';

if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const api = axios.create({
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

api.defaults.baseURL = getBackendBaseUrl();
if (typeof window !== 'undefined') {
  api.defaults.baseURL = '/api/proxy';
}

const UpperArticles_API_URL = `/api/UpperArticles`;

// UpperArticles API Functions
export const getUpperArticles = async (): Promise<UpperArticle[]> => {
  try {
    const response = await api.get(UpperArticles_API_URL, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const getUpperArticle = async (id: number): Promise<UpperArticle> => {
  try {
    const response = await api.get(`${UpperArticles_API_URL}/${id}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const createUpperArticle = async (upperArticleData: CreateUpperArticleDto): Promise<UpperArticle> => {
  try {
    const response = await api.post(UpperArticles_API_URL, upperArticleData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const updateUpperArticle = async (id: number, upperArticleData: UpdateUpperArticleDto): Promise<void> => {
  try {
    await api.put(`${UpperArticles_API_URL}/${id}`, upperArticleData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const deleteUpperArticle = async (id: number): Promise<void> => {
  try {
    await api.delete(`${UpperArticles_API_URL}/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};
