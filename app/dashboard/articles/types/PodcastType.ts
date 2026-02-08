export interface PodcastType {
  podcastId: number;
  podcastName: string;
  podcastLink?: string;
  isPublished?: boolean;
}

export interface CreatePodcastTypeDto {
  podcastName: string;
  podcastLink?: string;
  isPublished?: boolean;
}

export interface UpdatePodcastTypeDto {
  podcastName?: string;
  podcastLink?: string;
  isPublished?: boolean;
}