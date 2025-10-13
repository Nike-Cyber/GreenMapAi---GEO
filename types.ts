export enum ReportType {
  TreePlantation = 'Tree Plantation',
  PollutionHotspot = 'Pollution Hotspot',
}

export interface Report {
  id: number;
  type: ReportType;
  location: string;
  description: string;
  coords: {
    lat: number;
    lng: number;
  };
  reportedAt: Date;
  user: {
    name: string;
    avatar: string;
  };
}

export interface ChatMessage {
    id: number;
    sender: 'user' | 'bot';
    text: string;
    isTyping?: boolean;
}

export interface NewsArticle {
  id: number;
  title: string;
  source: string;
  publishedAt: string;
  summary: string;
  imageUrl: string;
  url: string;
}

export enum FeedbackCategory {
  General = 'General Feedback',
  Bug = 'Bug Report',
  Feature = 'Feature Request',
}

export enum FeedbackStatus {
  Received = 'Received',
  InProgress = 'In Progress',
  Completed = 'Completed',
}

export interface Feedback {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  category: FeedbackCategory;
  message: string;
  submittedAt: Date;
  status: FeedbackStatus;
  isImportant?: boolean;
}