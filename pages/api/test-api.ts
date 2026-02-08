import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import https from 'https';

// Backend API configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tajdeediq-001-site1.stempurl.com';

// Configure axios to handle HTTPS development certificates
const axiosInstance = axios.create({
  timeout: 10000,
  httpsAgent: process.env.NODE_ENV === 'development' ? 
    new https.Agent({ rejectUnauthorized: false }) : undefined
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Testing API connection to:', BASE_URL);
    
    // Test Articles API
    try {
      const articlesResponse = await axiosInstance.get(`${BASE_URL}/api/Articles`);
      console.log('Articles API Response Status:', articlesResponse.status);
      console.log('Articles API Response Data (sample):', {
        length: articlesResponse.data?.length,
        firstItem: articlesResponse.data?.[0]
      });
    } catch (error) {
      console.error('Articles API Error:', error);
    }

    // Test Categories API
    try {
      const categoriesResponse = await axiosInstance.get(`${BASE_URL}/api/Categories`);
      console.log('Categories API Response Status:', categoriesResponse.status);
      console.log('Categories API Response Data (sample):', {
        length: categoriesResponse.data?.length,
        firstItem: categoriesResponse.data?.[0]
      });
    } catch (error) {
      console.error('Categories API Error:', error);
    }

    // Test Breaking News API
    try {
      const breakingNewsResponse = await axiosInstance.get(`${BASE_URL}/api/BreakingNews`);
      console.log('Breaking News API Response Status:', breakingNewsResponse.status);
      console.log('Breaking News API Response Data (sample):', {
        length: breakingNewsResponse.data?.length,
        firstItem: breakingNewsResponse.data?.[0]
      });
    } catch (error) {
      console.error('Breaking News API Error:', error);
    }

    res.status(200).json({ 
      message: 'API test completed - check server console for detailed logs',
      baseUrl: BASE_URL,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('General API test error:', error);
    res.status(500).json({ 
      error: 'API test failed', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
}