import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import https from 'https';

// Backend API configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tajdeediq-001-site1.stempurl.com';

// Configure axios to handle HTTPS development certificates
const axiosInstance = axios.create({
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  httpsAgent: process.env.NODE_ENV === 'development' ? 
    new https.Agent({ 
      rejectUnauthorized: false,
      requestCert: false
    }) : undefined
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('=== Dashboard Stats API Called ===');
  console.log('BASE_URL:', BASE_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV);

  let totalArticles = 0;
  let totalCategories = 0;
  let totalBreakingNews = 0;
  let publishedArticles = 0;
  let recentArticles = 0;

  try {
    // Fetch articles
    console.log('Fetching articles...');
    try {
      const articlesResponse = await axiosInstance.get(`${BASE_URL}/api/Articles`);
      console.log('Articles Status:', articlesResponse.status);
      
      if (articlesResponse.data && Array.isArray(articlesResponse.data)) {
        totalArticles = articlesResponse.data.length;
        console.log('Total Articles:', totalArticles);
        
        // Log first article structure for debugging
        if (articlesResponse.data.length > 0) {
          console.log('First article structure:', Object.keys(articlesResponse.data[0]));
        }

        // Calculate published articles
        publishedArticles = articlesResponse.data.filter(article => 
          article.isPublished === true
        ).length;
        console.log('Published Articles:', publishedArticles);

        // Calculate recent articles (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        recentArticles = articlesResponse.data.filter(article => {
          try {
            const createdDate = new Date(article.createdDate);
            return createdDate > thirtyDaysAgo;
          } catch {
            return false;
          }
        }).length;
        console.log('Recent Articles:', recentArticles);
      }
    } catch (articlesError) {
      console.error('Error fetching articles:', articlesError);
      if (axios.isAxiosError(articlesError)) {
        console.error('Articles API Error Status:', articlesError.response?.status);
        console.error('Articles API Error Data:', articlesError.response?.data);
      }
    }

    // Fetch categories
    console.log('Fetching categories...');
    try {
      const categoriesResponse = await axiosInstance.get(`${BASE_URL}/api/Categories`);
      console.log('Categories Status:', categoriesResponse.status);
      
      if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
        totalCategories = categoriesResponse.data.length;
        console.log('Total Categories:', totalCategories);
      }
    } catch (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      if (axios.isAxiosError(categoriesError)) {
        console.error('Categories API Error Status:', categoriesError.response?.status);
      }
    }

    // Fetch breaking news
    console.log('Fetching breaking news...');
    try {
      const breakingNewsResponse = await axiosInstance.get(`${BASE_URL}/api/BreakingNews`);
      console.log('Breaking News Status:', breakingNewsResponse.status);
      
      if (breakingNewsResponse.data && Array.isArray(breakingNewsResponse.data)) {
        totalBreakingNews = breakingNewsResponse.data.length;
        console.log('Total Breaking News:', totalBreakingNews);
      }
    } catch (breakingNewsError) {
      console.error('Error fetching breaking news:', breakingNewsError);
      if (axios.isAxiosError(breakingNewsError)) {
        console.error('Breaking News API Error Status:', breakingNewsError.response?.status);
      }
    }

    const stats = {
      totalArticles,
      totalCategories,
      totalBreakingNews,
      publishedArticles,
      recentArticles
    };

    console.log('=== Final Stats ===');
    console.log(stats);
    console.log('==================');

    res.status(200).json(stats);

  } catch (error) {
    console.error('=== General Error ===');
    console.error('Error:', error);
    console.error('===================');
    
    // Return default values on error
    res.status(200).json({
      totalArticles: 0,
      totalCategories: 0,
      totalBreakingNews: 0,
      publishedArticles: 0,
      recentArticles: 0,
      error: 'Failed to fetch data from backend'
    });
  }
}