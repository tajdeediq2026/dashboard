export interface ArticleCreate {
  articleTitle: string;
  articleSummary: string;
  articleContent: string;  
  content?: string;
  isPublished: boolean;
  editorChoice?: boolean;
  facebook?: boolean;
  twitter?: boolean;
  createdDate?: Date;
  
  categoryId: {
    id: number;
    name: string;
  };
  
  tagId?: number;
  podcastTypeId?: number;
  upperArticleId?: number;
}

export interface ArticleAll {
  id: string;
  articleTitle: string;
  articleSummary?: string;
  articleContent?: string;
  imagePath?: string;
  isPublished: boolean;
  editorChoice?: boolean;
  facebook?: boolean;
  twitter?: boolean;
  createdDate?: Date;
  updatedDate?: Date;
  categoryId: number;
  categoryName?: string;
  tagId?: number;
  podcastTypeId?: number;
  upperArticleId?: number;
  category: {
    id: number;
    name: string;
  };
}
