export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
}

export enum GeminiStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
