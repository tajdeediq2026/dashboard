import axios from 'axios';
import { ArticleAll, ArticleCreate } from '../types/Article';
import { CategoryAll } from '../types/Category';
import { Tag, CreateTagDto, UpdateTagDto } from '../types/Tag';
import { PodcastType } from '../types/PodcastType';
import { UpperArticle, CreateUpperArticleDto, UpdateUpperArticleDto } from '../../upper-articles/types/UpperArticle';

if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Create axios instance with better error handling
const api = axios.create({
  timeout: 30000, // 30 s — gives slow shared-hosting backends enough time
  headers: {
    'Accept': 'application/json'
  }
});

// Set default baseURL to server-side configured API; client will override to use proxy.
api.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://tajdeediq-001-site1.stempurl.com';
if (typeof window !== 'undefined') {
  api.defaults.baseURL = '';
}

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

const API_PREFIX = typeof window === 'undefined' ? '/api' : '/api/backend';
const API_URL = `${API_PREFIX}/Articles`;
const Categories_API_URL = `${API_PREFIX}/Categories`;
const Tags_API_URL = `${API_PREFIX}/Tags`;
const PodcastTypes_API_URL = `${API_PREFIX}/PodcastTypes`;
const UpperArticles_API_URL = `${API_PREFIX}/UpperArticles`;

export const updateArticle = async (id: string, articleData: ArticleCreate, file?: File): Promise<ArticleAll> => {
  try {
    console.log('Updating article with data:', {
      id: id,
      title: articleData.articleTitle,
      summary: articleData.articleSummary,
      categoryId: articleData.categoryId.id,
      upperArticleId: articleData.upperArticleId,
      hasFile: !!file
    });

    const formData = new FormData();
    
    // Append basic article data
    formData.append('articleTitle', articleData.articleTitle);
    formData.append('articleSummary', articleData.articleSummary);
    formData.append('articleContent', articleData.articleContent);
    formData.append('content', articleData.content || '');
    formData.append('categoryId', articleData.categoryId.id.toString());
    
    // Append additional fields if they exist in ArticleCreate
    if (articleData.isPublished !== undefined) {
      formData.append('isPublished', articleData.isPublished.toString());
    }
    if (articleData.editorChoice !== undefined) {
      formData.append('editorChoice', articleData.editorChoice.toString());
    }
    if (articleData.facebook !== undefined) {
      formData.append('facebook', articleData.facebook.toString());
    }
    if (articleData.twitter !== undefined) {
      formData.append('twitter', articleData.twitter.toString());
    }
    if (articleData.tagId !== undefined) {
      formData.append('tagId', articleData.tagId.toString());
    }
    if (articleData.podcastTypeId !== undefined) {
      formData.append('podcastTypeId', articleData.podcastTypeId.toString());
    }
    
    // Always send upperArticleId (0 means no assignment/remove assignment)
    const upperArticleIdValue = articleData.upperArticleId ?? 0;
    formData.append('upperArticleId', upperArticleIdValue.toString());
    
    if (articleData.createdDate) {
      formData.append('createdDate', articleData.createdDate.toISOString());
    }

    // Append image file if it exists
    if (file) {
      formData.append('Image', file, file.name);
      console.log('Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
    }

    const response = await api.put<ArticleAll>(`${API_URL}/${id}`, formData, {
      headers: {
        Accept: 'application/json'
      },
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      validateStatus: () => true
    });

    if (response.status >= 400) {
      const errorPayload = typeof response.data === 'string'
        ? response.data
        : JSON.stringify(response.data);
      console.error('Update article failed:', errorPayload);
      throw new Error(errorPayload || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204 || response.data == null) {
      console.log('Article updated successfully (no content response)');
      return {} as ArticleAll;
    }

    console.log('Article updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in updateArticle:', error);
    throw error;
  }
};

export const createArticle = async (articleData: ArticleCreate, file?: File): Promise<ArticleAll> => {
  try {
    console.log('=== STARTING CREATE ARTICLE ===');
    console.log('Creating article with data:', {
      title: articleData.articleTitle,
      summary: articleData.articleSummary,
      categoryId: articleData.categoryId?.id,
      categoryIdType: typeof articleData.categoryId?.id,
      upperArticleId: articleData.upperArticleId,
      upperArticleIdType: typeof articleData.upperArticleId,
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size
    });

    // Validate required fields
    if (!articleData.articleTitle?.trim()) {
      throw new Error('Article title is required');
    }
    if (!articleData.articleSummary?.trim()) {
      throw new Error('Article summary is required');
    }
    if (!articleData.articleContent?.trim()) {
      throw new Error('Article content is required');
    }
    if (!articleData.categoryId?.id) {
      throw new Error('Category ID is required');
    }

    console.log('=== CHECKING CATEGORY ===');
    // Check if category exists
    let categoryResponse;
    try {
      categoryResponse = await api.get(`${Categories_API_URL}/${articleData.categoryId.id}`);
      console.log('Category response:', categoryResponse.data);
      if (!categoryResponse.data) {
        throw new Error('Category not found');
      }
    } catch (categoryError) {
      console.error('Category lookup failed:', categoryError);
      throw new Error(`Category with ID ${articleData.categoryId.id} not found`);
    }

    console.log('=== CREATING FORMDATA ===');
    // Create FormData for multipart/form-data submission
    const formData = new FormData();
    
    try {
      // Append article data
      console.log('Adding basic fields to FormData...');
      formData.append('articleTitle', articleData.articleTitle);
      formData.append('articleSummary', articleData.articleSummary);
      formData.append('articleContent', articleData.articleContent);
      formData.append('categoryId', articleData.categoryId.id.toString());
      console.log('Basic fields added successfully');
    } catch (formDataError) {
      console.error('Error adding basic fields to FormData:', formDataError);
      throw new Error('Failed to prepare basic article data');
    }
    
    // Append additional fields if they exist in ArticleCreate
    if (articleData.isPublished !== undefined) {
      formData.append('isPublished', articleData.isPublished.toString());
    }
    if (articleData.facebook !== undefined) {
      formData.append('facebook', articleData.facebook.toString());
    }
    if (articleData.twitter !== undefined) {
      formData.append('twitter', articleData.twitter.toString());
    }
    if (articleData.tagId !== undefined) {
      formData.append('tagId', articleData.tagId.toString());
    }
    if (articleData.podcastTypeId !== undefined) {
      formData.append('podcastTypeId', articleData.podcastTypeId.toString());
    }
    // Always send upperArticleId (0 means no assignment/remove assignment)
    const upperArticleIdValue = articleData.upperArticleId ?? 0;
    console.log('Adding upperArticleId to FormData:', upperArticleIdValue, typeof upperArticleIdValue);
    formData.append('upperArticleId', upperArticleIdValue.toString());
    
    // Send required date fields - backend expects DateTimeOffset
    const now = new Date().toISOString();
    formData.append('createdDate', articleData.createdDate ? articleData.createdDate.toISOString() : now);
    formData.append('updatedDate', now);
    console.log('Added date fields:', { createdDate: articleData.createdDate?.toISOString() || now, updatedDate: now });

          categoryResponse = await api.get(`${Categories_API_URL}/${articleData.categoryId.id}`);
    if (file) {
      formData.append('Image', file, file.name);
      console.log('Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type,
        fieldName: 'Image'
      });
    }

    // Log FormData entries for debugging
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, `File: ${value.name} (${value.size} bytes, ${value.type})`);
      } else {
        console.log(key, value);
      }
    }
    
    // Log request URL and method
    console.log('Making POST request to:', API_URL);
    console.log('Request headers will include Accept: application/json');

    // Send the request with proper headers for file upload
    // Note: Don't manually set Content-Type for multipart/form-data, let axios handle it
    console.log('About to send POST request to:', API_URL);
    const response = await api.post<ArticleAll>(API_URL, formData, {
      headers: {
        'Accept': 'application/json'
      },
      timeout: 30000, // 30 second timeout
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      validateStatus: (status) => status < 500 // Don't throw on 4xx errors, let us handle them
    });

    console.log('Received response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    // Check if the response was successful
    if (response.status >= 400) {
      console.error('Server returned error status:', response.status);
      console.error('Error response data:', response.data);
      throw new Error(`Server error: ${response.status} - ${JSON.stringify(response.data)}`);
    }

    console.log('Article created successfully:', response.data);

    // Return the response data as is since backend returns proper format
    return {
      ...response.data,
      category: {
        id: categoryResponse.data.id,
        name: categoryResponse.data.name
      }
    };
  } catch (error) {
    console.error('Full error object:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    
    if (axios.isAxiosError(error)) {
      console.error('Axios Error Details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        },
        hasResponse: !!error.response,
        hasRequest: !!error.request
      });
      // Try to extract error message from different possible formats
      let errorMessage = 'فشل في إنشاء المقال';
      
      if (error.response?.status === 400) {
        errorMessage = 'خطأ في البيانات المرسلة - يرجى التحقق من جميع الحقول المطلوبة';
      } else if (error.response?.status === 409) {
        errorMessage = 'المقال العلوي محجوز بالفعل لمقال آخر';
      }
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.title) {
          errorMessage = error.response.data.title;
        } else if (error.response.data.errors) {
          // Handle validation errors
          const validationErrors = Object.values(error.response.data.errors).flat().join(', ');
          errorMessage = `خطأ في التحقق: ${validationErrors}`;
        } else if (typeof error.response.data === 'object') {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
    console.error('Non-Axios error:', error);
    throw error;
  }
};

export const getArticles = async (): Promise<ArticleAll[]> => {
  try {
    const response = await api.get(API_URL, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      // Add timestamp to prevent caching
      params: {
        _t: Date.now()
      }
    });
    console.log('Raw API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getArticles:', error);
    throw error;
  }
};

export const getArticle = async (id: string): Promise<ArticleAll> => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};


export const createTodo = async (data: { articleTitle: string; categoryId: number }): Promise<ArticleAll> => {
  try {
    // Validate category existence before proceeding
    const categoryResponse = await api.get(`${Categories_API_URL}/${data.categoryId}`);
    if (!categoryResponse.data || !categoryResponse.data.name) {
      throw new Error('Category does not exist');
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('articleTitle', data.articleTitle);
    formData.append('categoryId', data.categoryId.toString());
    formData.append('content', '');  // Optional: Add default content if needed
    formData.append('excerpt', data.articleTitle.substring(0, 100));  // Optional: Generate excerpt from title

    const response = await api.post<ArticleAll>(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    // Return formatted response with category information
    return {
      id: response.data.id,
      articleTitle: response.data.articleTitle,
      articleSummary: response.data.articleSummary,
      articleContent: response.data.articleContent,
      imagePath: response.data.imagePath,
      isPublished: response.data.isPublished,
      facebook: response.data.facebook,
      twitter: response.data.twitter,
      createdDate: response.data.createdDate,
      updatedDate: response.data.updatedDate,
      categoryId: Number(response.data.categoryId),
      categoryName: response.data.categoryName,
      tagId: response.data.tagId,
      podcastTypeId: response.data.podcastTypeId,
      upperArticleId: response.data.upperArticleId,
      category: {
        id: categoryResponse.data.id,
        name: categoryResponse.data.name
      }
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      throw new Error(error.response?.data?.message || 'Failed to create article');
    }
    throw error;
  }
};
export const createCategory = async (todo: Omit<CategoryAll, 'id' |'categorySlug'>): Promise<CategoryAll> => {
  const response = await api.post(Categories_API_URL, todo);
  return response.data;
}

// Add these new functions
export const getCategories = async (): Promise<CategoryAll[]> => {
  try {
    const response = await api.get(Categories_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const updateCategory = async (id: number, categoryData: Partial<CategoryAll>): Promise<CategoryAll> => {
  try {
    const response = await api.put(`${Categories_API_URL}/${id}`, {
      ...categoryData,
      id: id // Ensure ID is included in the request
    });
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`${Categories_API_URL}/${id}`);
};

export const getArticlesByCategory = async (categoryId: number): Promise<ArticleAll[]> => {
  try {
    const response = await api.get(`${API_URL}/category/${categoryId}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('خطأ في جلب المقالات:', error.response?.data);
      throw new Error('فشل في جلب المقالات للتصنيف المحدد');
    }
    throw error;
  }
};

// Tags API Functions
export const getTags = async (): Promise<Tag[]> => {
  try {
    const response = await api.get(Tags_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('انتهت مهلة الاتصال بالخادم — يرجى المحاولة مرة أخرى');
      }
      if (error.response?.status === 504) {
        throw new Error('الخادم لم يستجب في الوقت المتوقع — يرجى المحاولة مرة أخرى');
      }
    }
    throw error;
  }
};

export const getTag = async (id: number): Promise<Tag> => {
  try {
    const response = await api.get(`${Tags_API_URL}/${id}`, {
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

export const createTag = async (tagData: CreateTagDto): Promise<Tag> => {
  try {
    // Ensure backend property names match expected DTO (TagName)
    const payload: { TagName: string } = { TagName: tagData.tagName };
    console.log('createTag payload:', payload);

    const response = await api.post<Tag>(Tags_API_URL, payload, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      validateStatus: () => true // handle errors manually so we can log response body
    });

    console.log('createTag response status:', response.status, 'data:', response.data);

    if (response.status >= 400) {
      const body = response.data as { error?: string; inner?: string; title?: string; errors?: Record<string, string[]> } | null;
      const validationError = body?.errors ? JSON.stringify(body.errors) : null;
      const msg = body?.inner || body?.error || body?.title || validationError || `createTag failed with status ${response.status}`;
      console.error('createTag failed:', response.status, body);
      throw new Error(msg);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const updateTag = async (id: number, tagData: UpdateTagDto): Promise<void> => {
  try {
    const payload: { TagName?: string } = {};
    if (tagData.tagName !== undefined && tagData.tagName !== null) {
      payload.TagName = tagData.tagName!;
    }
    await api.put(`${Tags_API_URL}/${id}`, payload, {
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

export const deleteTag = async (id: number): Promise<void> => {
  try {
    await api.delete(`${Tags_API_URL}/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

// PodcastTypes API Functions
export const getPodcastTypes = async (): Promise<PodcastType[]> => {
  try {
    const response = await api.get(PodcastTypes_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching podcast types:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

// UpperArticles API Functions
export const getUpperArticles = async (): Promise<UpperArticle[]> => {
  try {
    const response = await api.get(UpperArticles_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching upper articles:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};

export const getAvailableUpperArticles = async (excludeArticleId?: string): Promise<UpperArticle[]> => {
  try {
    // Try the new Available endpoint first
    const params = excludeArticleId ? { excludeArticleId } : {};
    
    const response = await api.get(`${UpperArticles_API_URL}/Available`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      params
    });
    return response.data;
  } catch (error) {
    console.warn('Available endpoint failed, falling back to client-side filtering:', error);
    
    // Fallback to client-side filtering if the Available endpoint fails
    try {
      // Get all upper articles
      const allUpperArticles = await getUpperArticles();
      
      // Get all articles to check which upper articles are already in use
      const allArticles = await getArticles();
      
      // Find upper articles that are not linked to any article (or excluding specific article)
      const usedUpperArticleIds = allArticles
        .filter(article => 
          article.upperArticleId && 
          (!excludeArticleId || article.id !== excludeArticleId)
        )
        .map(article => article.upperArticleId);
      
      // Return only unused upper articles
      return allUpperArticles.filter(upperArticle => 
        !usedUpperArticleIds.includes(upperArticle.upperArticleId)
      );
    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError);
      if (axios.isAxiosError(fallbackError)) {
        console.error('API Error:', fallbackError.response?.data);
        console.error('Status:', fallbackError.response?.status);
      }
      throw fallbackError;
    }
  }
};

export const getUpperArticleById = async (id: number): Promise<UpperArticle> => {
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

export const createUpperArticle = async (upperArticle: CreateUpperArticleDto): Promise<UpperArticle> => {
  try {
    const response = await api.post(UpperArticles_API_URL, upperArticle, {
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

export const updateUpperArticle = async (id: number, upperArticle: UpdateUpperArticleDto): Promise<UpperArticle> => {
  try {
    const response = await api.put(`${UpperArticles_API_URL}/${id}`, upperArticle, {
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

export const deleteUpperArticle = async (id: number): Promise<void> => {
  try {
    await api.delete(`${UpperArticles_API_URL}/${id}`, {
      headers: {
        'Accept': 'application/json'
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
