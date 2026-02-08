import axios from 'axios';
import { UpperArticle, CreateUpperArticleDto, UpdateUpperArticleDto } from '../types/UpperArticle';

// Configure axios for HTTPS development with self-signed certificates
if (typeof window === 'undefined') {
  // Server-side configuration
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const UpperArticles_API_URL = 'https://tajdeediq-001-site1.stempurl.com/api/UpperArticles';

// UpperArticles API Functions
export const getUpperArticles = async (): Promise<UpperArticle[]> => {
  try {
    const response = await axios.get(UpperArticles_API_URL, {
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
    const response = await axios.get(`${UpperArticles_API_URL}/${id}`, {
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
    const response = await axios.post(UpperArticles_API_URL, upperArticleData, {
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
    await axios.put(`${UpperArticles_API_URL}/${id}`, upperArticleData, {
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
    await axios.delete(`${UpperArticles_API_URL}/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};
