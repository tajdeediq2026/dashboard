import { NextApiRequest, NextApiResponse } from 'next';

interface TestResult {
  endpoint: string;
  success: boolean;
  error?: string;
  data?: unknown;
  count?: number;
  status?: number;
  ok?: boolean;
  statusText?: string;
  dataLength?: number | string;
  sampleKeys?: string[] | null;
}

interface ApiDebugResponse {
  baseUrl: string;
  nodeEnv: string | undefined;
  timestamp: string;
  tests: {
    articles: TestResult;
    categories: TestResult;
    breakingNews: TestResult;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('=== API Debug Test ===');
  
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tajdeediq-001-site1.stempurl.com';
  console.log('Testing connection to:', BASE_URL);

  const testResults: ApiDebugResponse = {
    baseUrl: BASE_URL,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    tests: {
      articles: {
        endpoint: `${BASE_URL}/api/Articles`,
        success: false
      },
      categories: {
        endpoint: `${BASE_URL}/api/Categories`,
        success: false
      },
      breakingNews: {
        endpoint: `${BASE_URL}/api/BreakingNews`,
        success: false
      }
    }
  };

  // Test Articles API
  try {
    console.log('Testing Articles API...');
    const articlesResponse = await fetch(`${BASE_URL}/api/Articles`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    testResults.tests.articles.status = articlesResponse.status;
    testResults.tests.articles.ok = articlesResponse.ok;
    testResults.tests.articles.statusText = articlesResponse.statusText;

    if (articlesResponse.ok) {
      const data = await articlesResponse.json();
      testResults.tests.articles.success = true;
      testResults.tests.articles.data = data;
      testResults.tests.articles.dataLength = Array.isArray(data) ? data.length : 'Not an array';
      testResults.tests.articles.sampleKeys = data?.[0] ? Object.keys(data[0]) : null;
      testResults.tests.articles.count = Array.isArray(data) ? data.length : 0;
    } else {
      const errorText = await articlesResponse.text();
      testResults.tests.articles.error = errorText;
    }
  } catch (error) {
    testResults.tests.articles.error = error instanceof Error ? error.message : String(error);
  }

  // Test Categories API
  try {
    console.log('Testing Categories API...');
    const categoriesResponse = await fetch(`${BASE_URL}/api/Categories`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    testResults.tests.categories.status = categoriesResponse.status;
    testResults.tests.categories.ok = categoriesResponse.ok;
    testResults.tests.categories.statusText = categoriesResponse.statusText;

    if (categoriesResponse.ok) {
      const data = await categoriesResponse.json();
      testResults.tests.categories.success = true;
      testResults.tests.categories.data = data;
      testResults.tests.categories.dataLength = Array.isArray(data) ? data.length : 'Not an array';
      testResults.tests.categories.count = Array.isArray(data) ? data.length : 0;
    } else {
      const errorText = await categoriesResponse.text();
      testResults.tests.categories.error = errorText;
    }
  } catch (error) {
    testResults.tests.categories.error = error instanceof Error ? error.message : String(error);
  }

  // Test BreakingNews API
  try {
    console.log('Testing BreakingNews API...');
    const breakingNewsResponse = await fetch(`${BASE_URL}/api/BreakingNews`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    testResults.tests.breakingNews.status = breakingNewsResponse.status;
    testResults.tests.breakingNews.ok = breakingNewsResponse.ok;
    testResults.tests.breakingNews.statusText = breakingNewsResponse.statusText;

    if (breakingNewsResponse.ok) {
      const data = await breakingNewsResponse.json();
      testResults.tests.breakingNews.success = true;
      testResults.tests.breakingNews.data = data;
      testResults.tests.breakingNews.dataLength = Array.isArray(data) ? data.length : 'Not an array';
      testResults.tests.breakingNews.count = Array.isArray(data) ? data.length : 0;
    } else {
      const errorText = await breakingNewsResponse.text();
      testResults.tests.breakingNews.error = errorText;
    }
  } catch (error) {
    testResults.tests.breakingNews.error = error instanceof Error ? error.message : String(error);
  }

  console.log('=== Debug Results ===');
  console.log(JSON.stringify(testResults, null, 2));

  res.status(200).json(testResults);
}