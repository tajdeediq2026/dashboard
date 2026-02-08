export interface Tag {
  tagId: number;
  tagName: string;
}

export interface CreateTagDto {
  tagName: string;
}

export interface UpdateTagDto {
  tagName?: string;
}