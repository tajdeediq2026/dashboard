export interface UpperArticle {
  upperArticleId: number;
  upperArticleName: string;
}

export interface CreateUpperArticleDto {
  upperArticleName: string;
}

export interface UpdateUpperArticleDto {
  upperArticleName?: string;
}